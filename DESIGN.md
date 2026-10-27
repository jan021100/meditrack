---
name: MediTrack
description: A modern, warm medical practice.
colors:
  page: "#f5f6f5"
  surface: "#ffffff"
  ink: "#242b2a"
  muted: "#5e6966"
  line: "#d9dfdc"
  accent: "#365d50"
  hover: "#edf1ef"
  danger: "#9a3430"
  field-border: "#adbab5"
  placeholder: "#65736d"
  error-bg: "#f5e8e3"
  success: "#315940"
  success-bg: "#e7eee4"
typography:
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(28px, 3vw, 36px)"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  section-heading:
    fontSize: "22px"
    fontWeight: 500
    letterSpacing: "-0.015em"
  record-value:
    fontSize: "15px"
    lineHeight: 1.6
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
  list:
    fontSize: "14px"
  label:
    fontSize: "13px"
rounded:
  field: "7px"
  control: "6px"
  menu-item: "3px"
spacing:
  small: "12px"
  medium: "20px"
  large: "24px"
  section: "40px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "{colors.accent}"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "11px 13px"
  link-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "11px 16px"
  button-retry:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
---

# Design System: MediTrack

## Overview

**Creative North Star: "Modern, warm medical practice"**

Friendly professionalism comes from neutral surfaces, dark system typography, muted green accents and fine rules. Sparse English controls keep patient records easy to scan.

This captures the shared design across the header, home, account screens, patient lists, read-only records and clinical forms.

**Key Characteristics:**
- Neutral off-white canvas and white surfaces.
- Restrained green accents and clear type.
- Spacious rows with fine dividers.

## Colors

### Primary
Muted practice green marks navigation, focus and action hover. The main action rests in dark ink.

### Neutral
Neutral page and white surface tones separate canvas from header. Ink carries content; muted text carries supporting detail; line defines list boundaries. Hover gently shades interactive rows. Danger is available as a global token.

## Typography

Use the native system font stack. Page headings use the headline token; supporting prose uses a relaxed line height (1.6). Patient rows use tabular numerals, medium-weight case IDs and the list size. Counts and column headings use the label size.

## Layout

Content is centered within (1120px). The header container is (1232px), with horizontal padding (40px); main padding is (48px 40px 80px). At widths up to (600px), header padding becomes (16px 20px), main padding becomes (28px 20px 56px), page actions stack and the account name hides.

Patient lists use six columns with gaps (24px) and row padding (26px 20px). At widths up to (850px), rows become two columns with visible field labels, a full-width case ID and padding (24px 16px).

Forms are centered within (840px), authentication within (460px). Form grids use two columns with gaps (24px), collapsing to one at (600px); mobile footer actions fill the width. Shell padding includes device safe-area insets and the viewport uses viewport-fit=cover.

Read-only records use definition lists with two columns and gaps (28px 40px), switching to one column at (600px). Record heading/actions and event headings stack at (750px); action links wrap.

## Elevation & Depth

The adopted header and list are flat, separated by fine rules and hover tone. Only the account menu lifts with a shadow (0 8px 28px rgb(36 41 37 / 12%)). Forms use the same flat fine-rule treatment.

## Shapes

Actions and account menus have gently rounded corners using the control token; menu items use the smaller token. Avatars and the brand dot are circular. List rows have square edges and thin horizontal rules (1px).

## Components

- **Actions:** dark primary action and outlined retry control, both with minimum height (44px); hover uses accent or hover tone respectively.
- **Navigation:** active patient navigation uses green text and underline; inactive links are muted. The native account disclosure exposes profile, settings and logout options, dismisses on outside click or Escape, and restores summary focus on Escape. A keyboard skip link targets main content.
- **Patient rows:** the entire row links to the case; a trailing chevron signals navigation. Missing values read “Not recorded”. Client-side pagination shows 25 records per page.
- **List states:** loading, empty and error content share a top rule and vertical padding (48px); errors offer “Try again”.
- **Focus:** global visible focus uses an accent outline (2px) with offset (4px). Disabled buttons use opacity (0.55).
- **Patient record:** fine-rule sections for baseline, initial surgery, additional information and further treatment. Section headings (22px/500), event headings (18px/500), values (15px/1.6). Secondary navigation actions use surface fill and a fine outline, not three primary buttons. Human-readable field labels retain numeric zero and boolean values; empty values and technical metadata are omitted.
- **Forms:** shared fields use surface fill, field-border outline, field radius, text (16px), minimum height (48px), and padding (11px 13px). Read-only fields use muted text on hover tone; textareas resize vertically from (112px). Labels are (14px/500). Error and success feedback use their corresponding text/background tokens.
- **Interaction:** immediate pressed opacity (0.8), without transition animation. Hover treatments apply only to hover-capable fine pointers. Higher-contrast preferences strengthen muted text and borders.


## Do's and Don'ts

### Do:
- Do retain system typography and sparse English controls.
- Do reuse the shared palette, fine rules and responsive patient rows.
- Do show visible keyboard focus and explicit loading, empty and error states.

### Don't:
- Don't add decorative elevation to flat content and form sections.
