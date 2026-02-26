# AB Markers — After Effects Marker Workflow Tools

Two companion ExtendScript (`.jsx`) utilities for After Effects that work together to create and navigate a marker-based timing system for broadcast/post workflows.

---

## Installation

**Run once:**
File → Scripts → Run Script File → select the `.jsx`

**Install permanently (recommended):**
Copy `.jsx` files into your After Effects Scripts folder:
- macOS: `Applications/Adobe After Effects [version]/Scripts/`
- Windows: `C:\Program Files\Adobe\Adobe After Effects [version]\Support Files\Scripts\`

Restart Ae. Scripts will appear under **File → Scripts**.

> **Allow scripts to write files:** Preferences → Scripting & Expressions → ✓ Allow Scripts to Write Files and Access Network

---

## Workflow Overview

These two scripts are designed to be used together:

1. **`AB_MakeMarkers`** — stamps a MARKERS adjustment layer onto a comp with labeled markers at clean 10-second intervals (000, 010, 020 ... 200)
2. **`AB_MarkerCall`** — reads markers from a selected layer and slips it so a chosen marker lands at comp time 0

The typical use case is a master comp or precomp that contains a slipped source layer (e.g. a `_PHONE_MASTER` or `_VIDEO_MASTER`). `AB_MarkerCall` lets you snap that layer to any marker without doing the slip math manually.

---

## Scripts

---

### `AB_MakeMarkers.jsx`

Adds a MARKERS adjustment layer to the active comp, stamped with labeled markers at every 10-second timecode interval from `000` through `200`.

**How to use:**
- Open a comp and run the script, **or**
- Run with no active comp — it will create a new `MARKERS` comp (1920×1080, 23.976fps, 210s)

**Output:**
- A null/adjustment layer named `MARKERS` at the top of the layer stack
- Layer markers at: `000` (0s), `010` (10s), `020` (20s) ... `200` (200s)
- Marker labels are zero-padded three-digit strings (`010`, `020`, etc.) to match shot naming conventions

**Notes:**
- Marker timing uses integer 24fps frame counts multiplied by the comp's actual frame duration — avoids floating point drift at non-integer framerates (e.g. 23.976)
- Safe to run on an existing comp — adds a new layer, does not modify existing ones
- Single undo group

---

### `AB_MarkerCall.jsx`

Reads all markers from a selected layer and presents a dropdown dialog. Selecting a marker slips the layer so that marker aligns to comp time 0, with in/out points pinned to the full comp duration.

**How to use:**
1. Open a comp containing a layer with markers (e.g. a slipped master comp layer)
2. Select that layer
3. Run the script
4. Choose a marker from the dropdown — labeled by comment/name + timecode in seconds
5. Click **Slip Layer**

**Output:**
- `layer.startTime` is set to `-markerTime` so the chosen marker falls at comp time 0
- `inPoint` → 0, `outPoint` → comp duration

**Notes:**
- The script temporarily expands the layer to its full source duration before reading markers, then restores original timing — this ensures markers that fall outside the current trim window are still accessible
- Works on any AVLayer with markers: precomps, footage, adjustment layers
- If no markers are found, alerts and exits cleanly
- Single undo group per slip operation

---

## Requirements

- Adobe After Effects CC 2019 or later
- ExtendScript (built into Ae — no additional installs)
- `AB_MarkerCall` requires an active comp with at least one AV layer selected

---

## Notes

- Both scripts use a single undo group — one Cmd/Ctrl+Z rolls back the operation
- Marker labels follow the same zero-padded three-digit convention used in shot naming (`010`, `020`, etc.)
- Designed to complement the `AB_PhoneHome` master comp slip workflow — see [AB_Scripts](../AB_Scripts)

---

*AB Markers — internal broadcast post tools*
