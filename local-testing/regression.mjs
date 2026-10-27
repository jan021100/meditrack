// Local-only regression test: independent clients, disposable records, cleanup and unchanged-data check.
import { createRequire } from 'node:module';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const rulesResponse=await fetch('http://127.0.0.1:8080/emulator/v1/projects/demo-meditrack:securityRules',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({rules:{files:[{name:'firestore.rules',content:await readFile(new URL('./firestore.rules',import.meta.url),'utf8')}]}})});
assert.ok(rulesResponse.ok,'Local rule compilation failed: '+await rulesResponse.text());
const root=fileURLToPath(new URL('..', import.meta.url));
const req=createRequire(root+'/package.json');
const {createServer}=await import(root+'/node_modules/vite/dist/node/index.js');
const server=await createServer({configFile:false,root,cacheDir:'/tmp/meditrack-regression-vite',server:{middlewareMode:true,hmr:false},appType:'custom'});
process.env.FIRESTORE_EMULATOR_HOST='127.0.0.1:8080';process.env.FIREBASE_AUTH_EMULATOR_HOST='127.0.0.1:9099';
const admin=req('firebase-admin/app').initializeApp({projectId:'demo-meditrack'});
const adb=req('firebase-admin/firestore').getFirestore(admin);
const aauth=req('firebase-admin/auth').getAuth(admin);
const {initializeApp,deleteApp}=await server.ssrLoadModule('firebase/app');
const {getAuth,connectAuthEmulator,signInWithCustomToken}=await server.ssrLoadModule('firebase/auth');
const {getFirestore,connectFirestoreEmulator,getDocs,getDoc,doc,setDoc,updateDoc,deleteDoc,query,where,collection,terminate,serverTimestamp,getDocFromCache}=await server.ssrLoadModule('firebase/firestore');
const apps=[];const extraUids=[];let uid;
const otherPatient=adb.doc('patients/SYNTHETIC-ACCESS-OTHER-20261024');
const patientRef=adb.doc('patients/SYNTHETIC-CONCURRENCY-20261024');
async function capture(ref){const snap=await ref.get();const out={data:snap.data(),children:{}};for(const col of await ref.listCollections()){out.children[col.id]={};for(const d of(await col.orderBy('__name__').get()).docs)out.children[col.id][d.id]=await capture(d.ref);}return out;}
async function snapshot(){const value={};for(const d of(await adb.collection('patients').orderBy('__name__').get()).docs)value[d.id]=await capture(d.ref);return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');}
const before=await snapshot();
try{
 // The same draft boundary must preserve same-user navigation and reject every account switch.
 const {syncDraftIdentity,setCaseDraft,getCaseDraftFor,clearCaseDraft}=await server.ssrLoadModule('/src/lib/stores/caseStore.ts');
 const baseline={birthDate:'2000-01-01',height:180,weight:80,bmi:24.7,sex:'male',diseaseStartDate:'2025-01-01',familyHistory:'',previousSurgeries:0,previousSurgeryDetails:'',comments:'SYNTHETIC private draft A'};
 syncDraftIdentity('A');setCaseDraft('A',baseline);syncDraftIdentity('A');
 assert.equal(getCaseDraftFor('A').comments,baseline.comments); // Normal same-account navigation.
 const copy=getCaseDraftFor('A');copy.comments='changed outside store';assert.equal(getCaseDraftFor('A').comments,baseline.comments);
 syncDraftIdentity(null);assert.throws(()=>getCaseDraftFor('A')); // Logout clears A before B signs in.
 syncDraftIdentity('B');assert.throws(()=>getCaseDraftFor('B'));assert.throws(()=>setCaseDraft('A',baseline));
 setCaseDraft('B',{...baseline,comments:'SYNTHETIC private draft B'});assert.throws(()=>getCaseDraftFor('A'));assert.equal(getCaseDraftFor('B').comments,'SYNTHETIC private draft B');assert.equal(clearCaseDraft('A'),false);assert.equal(getCaseDraftFor('B').comments,'SYNTHETIC private draft B');
 syncDraftIdentity('A');assert.throws(()=>getCaseDraftFor('A')); // Direct UID switch, without menu logout.
 setCaseDraft('A',baseline);clearCaseDraft();assert.throws(()=>getCaseDraftFor('A'));syncDraftIdentity(null);
 console.log('Identity-bound draft isolation, logout, direct UID switch and same-user controls passed');
 const {buildProm}=await server.ssrLoadModule('/src/lib/prom.ts');
 const blank={painBefore:null,painDuringHealing:undefined,painToday:null,satisfaction:null,missedDays:null,qolImpact:'',sameSurgery:'',comments:''};
 assert.throws(()=>buildProm(blank),/at least one/);
 const partial=buildProm({...blank,painToday:0});assert.equal(partial.painBefore,null);assert.equal(partial.painToday,0);assert.equal(partial.promSchemaVersion,2);
 assert.equal(buildProm({...blank,satisfaction:5}).satisfaction,5);
 for(const invalid of [-1,11,2.5,NaN])assert.throws(()=>buildProm({...blank,painToday:invalid}));
 const {saveDocumentation}=await server.ssrLoadModule('/src/lib/firebase/documentation.ts');
 const {summarize,isSynthetic}=await server.ssrLoadModule('/src/lib/analysis/summary.ts');
 assert.ok(isSynthetic({dataOrigin:'synthetic_test'}));assert.ok(isSynthetic({excludeFromAnalysis:true}));
 const u=await aauth.createUser({email:'concurrency-20261024@example.invalid',password:'Disposable-20261024!'});uid=u.uid;
 await adb.doc('memberships/'+uid).create({approved:true,approvedBy:'local-test-fixture'});
 await patientRef.create({userId:uid,dataOrigin:'synthetic_test',excludeFromAnalysis:true,testRunId:'concurrency-20261024',operationDate:'2026-01-01'});
 await patientRef.collection('followups').doc('followup7').create({followUpNumber:7,additionalComments:'SYNTHETIC legacy sentinel'});
 await patientRef.collection('surgeries').doc('legacy').create({surgeryNumber:4,comments:'SYNTHETIC legacy sentinel'});
 const token=await aauth.createCustomToken(uid);
 for(let i=0;i<4;i++){const app=initializeApp({projectId:'demo-meditrack',apiKey:'demo-meditrack-key'},'concurrency-'+i);const auth=getAuth(app);connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true});const db=getFirestore(app);connectFirestoreEmulator(db,'127.0.0.1',8080);await signInWithCustomToken(auth,token);apps.push({app,db});}
 // Independent browser SDK instances, simultaneous writes, legacy gaps present.
 const f=await Promise.all(apps.map(({db},i)=>saveDocumentation(db,patientRef.id,'followups',{additionalComments:'SYNTHETIC concurrent '+i})));
 const s=await Promise.all(apps.map(({db},i)=>saveDocumentation(db,patientRef.id,'surgeries',{comments:'SYNTHETIC concurrent '+i})));
 assert.deepEqual(f.map(x=>x.number).sort((a,b)=>a-b),[8,9,10,11]);assert.equal(new Set(f.map(x=>x.id)).size,4);
 assert.deepEqual(s.map(x=>x.number).sort((a,b)=>a-b),[5,6,7,8]);
 assert.equal((await patientRef.collection('followups').get()).size,5);assert.equal((await patientRef.collection('surgeries').get()).size,5);
 assert.equal((await patientRef.collection('followups').doc('followup7').get()).data().additionalComments,'SYNTHETIC legacy sentinel');
 // Owner separation is tested with real Web SDK requests against the local rules.
 const makeClient=async(user,claims={})=>{const app=initializeApp({projectId:'demo-meditrack',apiKey:'demo-meditrack-key'},'access-'+user.uid);const auth=getAuth(app);connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true});const db=getFirestore(app);connectFirestoreEmulator(db,'127.0.0.1',8080);await signInWithCustomToken(auth,await aauth.createCustomToken(user.uid,claims));apps.push({app,db});return {db,user:auth.currentUser};};
 const denied=async(action)=>{await assert.rejects(action,error=>error.code==='permission-denied');};
 const b=await aauth.createUser({email:'access-b-20261024@example.invalid'});extraUids.push(b.uid);
 const manager=await aauth.createUser({email:'access-admin-20261024@example.invalid'});extraUids.push(manager.uid);
 await adb.doc('users/'+uid).create({role:'user',firstName:'SYNTHETIC A'});
 await adb.doc('users/'+b.uid).create({role:'admin',firstName:'SYNTHETIC spoofed profile'});
 await otherPatient.create({userId:b.uid,dataOrigin:'synthetic_test',testRunId:'access-20261024',excludeFromAnalysis:true,operationDate:'2026-01-01'});
 await otherPatient.collection('followups').doc('existing').create({comments:'SYNTHETIC other owner'});
 await adb.doc('memberships/'+b.uid).create({approved:true,approvedBy:'local-test-fixture'});
 const B=await makeClient(b),M=await makeClient(manager,{role:'admin'}),A=apps[0].db;
 const anonymousApp=initializeApp({projectId:'demo-meditrack',apiKey:'demo-meditrack-key'},'anonymous-access');
 const anonymousDb=getFirestore(anonymousApp);connectFirestoreEmulator(anonymousDb,'127.0.0.1',8080);apps.push({app:anonymousApp,db:anonymousDb});
 await denied(()=>getDoc(doc(anonymousDb,'patients',patientRef.id)));
 await denied(()=>getDocs(collection(anonymousDb,'patients')));
 await denied(()=>setDoc(doc(anonymousDb,'patients','SYNTHETIC-ANONYMOUS'),{userId:uid}));
 await denied(()=>getDoc(doc(anonymousDb,'users',uid)));
 for(const group of ['surgeries','followups','proms']){
   await denied(()=>getDocs(collection(anonymousDb,'patients',patientRef.id,group)));
   await denied(()=>setDoc(doc(A,'patients',otherPatient.id,group,'foreign-write'),{userId:uid}));
 }
 await denied(()=>updateDoc(doc(A,'patients',otherPatient.id),{comments:'foreign update'}));
 await denied(()=>deleteDoc(doc(A,'patients',otherPatient.id)));
 await denied(()=>updateDoc(doc(A,'patients',otherPatient.id,'followups','existing'),{comments:'foreign update'}));
 await denied(()=>deleteDoc(doc(A,'patients',otherPatient.id,'followups','existing')));
 await denied(()=>getDoc(doc(B.db,'patients',patientRef.id)));
 await denied(()=>getDocs(collection(B.db,'patients')));
 const ownedChild=doc(A,'patients',patientRef.id,'proms','owner-crud');
 await setDoc(ownedChild,{painToday:0});await updateDoc(ownedChild,{painToday:1});assert.equal((await getDoc(ownedChild)).data().painToday,1);await deleteDoc(ownedChild);
 await updateDoc(doc(A,'patients',patientRef.id),{comments:'SYNTHETIC owner update'});

 const {getAccess}=await server.ssrLoadModule('/src/lib/access.ts');assert.equal((await getAccess(B.user,B.db)).isAdmin,false);assert.equal((await getAccess(M.user,M.db)).isAdmin,true);
 const pending=await aauth.createUser({email:'pending-approval-20261027@example.invalid'});extraUids.push(pending.uid);
 const P=await makeClient(pending);
 await setDoc(doc(P.db,'users',pending.uid),{role:'user',approved:true}); // Editable profile fields cannot grant clinical access.
 assert.equal((await getAccess(P.user,P.db)).isApproved,false);
 await denied(()=>getDocs(query(collection(P.db,'patients'),where('userId','==',pending.uid))));
 const pendingCase=doc(P.db,'patients','SYNTHETIC-PENDING-APPROVAL-20261027');
 await denied(()=>setDoc(pendingCase,{userId:pending.uid,dataOrigin:'synthetic_test'}));
 await denied(()=>setDoc(doc(P.db,'memberships',pending.uid),{approved:true,approvedBy:pending.uid,approvedAt:serverTimestamp()}));
 await denied(()=>setDoc(doc(A,'memberships',pending.uid),{approved:true,approvedBy:uid,approvedAt:serverTimestamp()}));
 await denied(()=>getDocs(collection(P.db,'memberships')));
 await denied(()=>getDoc(doc(P.db,'memberships',uid)));
 await denied(()=>setDoc(doc(M.db,'memberships',pending.uid),{approved:true,approvedBy:pending.uid,approvedAt:serverTimestamp()}));
 await denied(()=>setDoc(doc(M.db,'memberships',pending.uid),{approved:true,approvedBy:manager.uid,approvedAt:serverTimestamp(),role:'admin'}));
 await setDoc(doc(M.db,'memberships',pending.uid),{approved:true,approvedBy:manager.uid,approvedAt:serverTimestamp()});
 assert.equal((await getAccess(P.user,P.db)).isApproved,true);
 await setDoc(pendingCase,{userId:pending.uid,dataOrigin:'synthetic_test'});
 assert.equal((await getDoc(pendingCase)).exists(),true);
 await setDoc(doc(M.db,'memberships',pending.uid),{approved:false,approvedBy:manager.uid,approvedAt:serverTimestamp()});
 assert.equal((await getAccess(P.user,P.db)).isApproved,false);
 await denied(()=>getDoc(pendingCase));await denied(()=>updateDoc(pendingCase,{comments:'revoked'}));
 await denied(()=>deleteDoc(pendingCase));
 assert.equal((await getDoc(doc(M.db,'patients',pendingCase.id))).exists(),true);
 await adb.doc('patients/'+pendingCase.id).delete();
 console.log('Pending-account denial, profile spoofing, admin approval, schema guards and revocation passed');

 assert.equal((await getDocs(query(collection(A,'patients'),where('userId','==',uid)))).size,1);
 await denied(()=>getDocs(collection(A,'patients')));await denied(()=>getDoc(doc(A,'patients',otherPatient.id)));
 await denied(()=>getDocs(collection(A,'patients',otherPatient.id,'followups')));
 await denied(()=>setDoc(doc(A,'patients',otherPatient.id),{userId:uid}));
 await denied(()=>updateDoc(doc(A,'patients',patientRef.id),{userId:b.uid}));
 await denied(()=>updateDoc(doc(A,'users',uid),{role:'admin'}));await denied(()=>getDoc(doc(A,'users',b.uid)));
 assert.equal((await getDoc(doc(M.db,'users',uid))).data().firstName,'SYNTHETIC A');
 assert.ok((await getDocs(collection(M.db,'patients'))).size>=10);
 await denied(()=>setDoc(doc(M.db,'patients','SYNTHETIC-ADMIN-CREATE'),{userId:manager.uid}));
 await denied(()=>updateDoc(doc(M.db,'patients',patientRef.id),{comments:'blocked'}));
 await denied(()=>deleteDoc(doc(M.db,'patients',patientRef.id)));
 await denied(()=>setDoc(doc(M.db,'patients',patientRef.id,'proms','blocked'),{painToday:0}));
 await denied(()=>updateDoc(doc(M.db,'patients',otherPatient.id,'followups','existing'),{comments:'blocked'}));
 await denied(()=>deleteDoc(doc(M.db,'patients',otherPatient.id,'followups','existing')));
 const {assessmentContext,followupOutcome}=await server.ssrLoadModule('/src/lib/clinical.ts');
 assert.equal((await assessmentContext(A,patientRef.id,'initial','2026-01-02')).operationId,'initial');
 await assert.rejects(()=>assessmentContext(A,patientRef.id,'initial','2025-12-31'),/precede/);
 await assert.rejects(()=>assessmentContext(A,patientRef.id,'absent','2026-01-02'),/no longer exists/);
 assert.throws(()=>followupOutcome({outcomeClassification:'Recurrence after complete healing',completeHealingDate:'',dateOfRecurrence:'2026-02-01',assessedOn:'2026-03-01'}),/requires/);
 assert.throws(()=>followupOutcome({outcomeClassification:'Persistent disease / never healed',completeHealingDate:'2026-01-10',dateOfRecurrence:'',assessedOn:'2026-03-01'}),/cannot/);
 const recurrence=followupOutcome({outcomeClassification:'Recurrence after complete healing',completeHealingDate:'2026-01-10',dateOfRecurrence:'2026-02-01',assessedOn:'2026-03-01',operationDate:'2026-01-01'});assert.equal(recurrence.recurrence,'Yes');
 const linked=summarize([{id:'linked',patient:{operationDate:'2026-01-01'},surgeries:[],proms:[],followups:[{operationId:'initial',completeHealingDate:'2026-01-11'},{operationId:'other',completeHealingDate:'2026-01-05'}]}]);assert.equal(linked.healing.median,10);
 console.log('Owner separation, admin read-only, profile spoofing denial, operation linkage and outcome validation passed');
 // Firestore memory belongs to a client, not an Auth UID. Account switches need a fresh document/client.
 let cacheApp,cacheDb;
 const freshCacheClient=async()=>{cacheApp=initializeApp({projectId:'demo-meditrack',apiKey:'demo-meditrack-key'},'cache-boundary');const auth=getAuth(cacheApp);connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true});cacheDb=getFirestore(cacheApp);connectFirestoreEmulator(cacheDb,'127.0.0.1',8080);return auth;};
 try{
   let cacheAuth=await freshCacheClient();await signInWithCustomToken(cacheAuth,token);
   assert.equal((await getDoc(doc(cacheDb,'patients',patientRef.id))).data().userId,uid);
   await signInWithCustomToken(cacheAuth,await aauth.createCustomToken(b.uid));
   assert.equal((await getDocFromCache(doc(cacheDb,'patients',patientRef.id))).data().userId,uid);
   await deleteApp(cacheApp);cacheApp=null;
   cacheAuth=await freshCacheClient();await signInWithCustomToken(cacheAuth,await aauth.createCustomToken(b.uid));
   await assert.rejects(()=>getDocFromCache(doc(cacheDb,'patients',patientRef.id)),error=>error.code==='unavailable');
   await denied(()=>getDoc(doc(cacheDb,'patients',patientRef.id)));
   console.log('Shared-client Auth cache retention reproduced; fresh client clears it and foreign server access remains denied');
 }finally{if(cacheApp){await terminate(cacheDb);await deleteApp(cacheApp);}}

 // Read the same publications as the UI, independent of any invented test case.
 const literature=[];for(const d of(await adb.collection('patients').where('dataOrigin','==','published_individual_case').get()).docs){const children=await Promise.all(['followups','surgeries','proms'].map(n=>d.ref.collection(n).get()));literature.push({id:d.id,patient:d.data(),followups:children[0].docs.map(x=>x.data()),surgeries:children[1].docs.map(x=>x.data()),proms:children[2].docs.map(x=>x.data())});}
 const result=summarize(literature);assert.equal(result.count,8);assert.equal(result.age.median,23);assert.equal(result.bmi.n,6);assert.equal(result.healing.n,6);assert.equal(result.healing.median,34);assert.equal(result.promRecords,0);
 const pathological=summarize([{id:'unit',patient:{birthDate:'2025-02-30',operationDate:'2026-01-01',bmi:''},surgeries:[],followups:[],proms:[{painToday:5}]}]);assert.equal(pathological.age.n,0);assert.equal(pathological.bmi.n,0);assert.equal(pathological.legacyPromRecords,1);assert.equal(pathological.answeredPainToday,0);
 const unhealed=summarize([{id:'negative',patient:{dataOrigin:'published_individual_case'},surgeries:[],proms:[],followups:[{woundStatus:'Not healed at all',followUpIntervalDays:14}]}]);assert.equal(unhealed.healing.n,0);
 console.log('PROM validation, independent-client concurrency and descriptive calculations passed');
}finally{
 for(const {app,db}of apps){await terminate(db);await deleteApp(app);}
 if(uid){const test=(await patientRef.get()).data();if(test?.userId!==uid||test?.testRunId!=='concurrency-20261024')throw Error('Unsafe cleanup target');await adb.recursiveDelete(patientRef);await adb.doc('users/'+uid).delete();await adb.doc('memberships/'+uid).delete();await aauth.deleteUser(uid);}
 if((await otherPatient.get()).exists){assert.equal((await otherPatient.get()).data().testRunId,'access-20261024','Unsafe foreign-case cleanup target');await adb.recursiveDelete(otherPatient);}
 for(const id of extraUids){await adb.doc('users/'+id).delete();await adb.doc('memberships/'+id).delete();await aauth.deleteUser(id);}
 assert.equal(await snapshot(),before,'Existing cases or children changed');
 await admin.delete();await server.close();
 console.log('Disposable concurrency data removed; existing records unchanged');
}
