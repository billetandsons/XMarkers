(function() {
    var comp = app.project.activeItem;
    if (!comp || !(comp instanceof CompItem)) { alert("Open a comp first."); return; }

    var layer = comp.selectedLayers[0];
    if (!layer || !(layer instanceof AVLayer)) { alert("Select an AV layer."); return; }

    // Save all timing
    var savedStartTime = layer.startTime;
    var savedInPoint   = layer.inPoint;
    var savedOutPoint  = layer.outPoint;

    var srcDuration = layer.source ? layer.source.duration : 3600;

    // Expand to full source duration to expose all markers
    layer.startTime = 0;
    layer.inPoint   = 0;
    layer.outPoint  = srcDuration;

    // Read ALL markers
    var markers = layer.marker;
    var markerCount = markers.numKeys;
    var markerData = [];
    for (var i = 1; i <= markerCount; i++) {
        markerData.push({
            index:   i,
            time:    markers.keyTime(i),
            comment: markers.keyValue(i).comment
        });
    }

    // Restore — outPoint first to avoid clamping
    layer.outPoint  = savedOutPoint;
    layer.inPoint   = savedInPoint;
    layer.startTime = savedStartTime;

    if (markerData.length === 0) {
        alert("No markers found on layer.");
        return;
    }

    // Build dropdown labels: comment/name first, then timecode
    var markerLabels = [];
    for (var j = 0; j < markerData.length; j++) {
        var m = markerData[j];
        var label = (m.comment && m.comment !== "") ? m.comment : ("Marker " + m.index);
        label += "  @  " + m.time.toFixed(2) + "s";
        markerLabels.push(label);
    }

    // Dialog
    var dlg = new Window("dialog", "Slip Layer to Marker");
    dlg.orientation = "column";
    dlg.alignChildren = ["fill", "top"];
    dlg.add("statictext", undefined, "Select target marker (will slip to layer in-point):");

    var dropdown = dlg.add("dropdownlist", undefined, markerLabels);
    dropdown.selection = 0;

    var btnGroup = dlg.add("group");
    btnGroup.alignment = "center";
    var okBtn     = btnGroup.add("button", undefined, "Slip Layer");
    var cancelBtn = btnGroup.add("button", undefined, "Cancel");

    cancelBtn.onClick = function() { dlg.close(); };

    okBtn.onClick = function() {
        var idx = dropdown.selection.index;
        var markerTimeOnLayer = markerData[idx].time;

        app.beginUndoGroup("Slip Layer to Marker " + (idx + 1));

        // Slip: keep inPoint/outPoint anchored in comp time
        // startTime defines where layer-time-0 falls in comp time
        // We want markerTimeOnLayer to appear at comp time 0 (start of comp)
        // So: comp_time = layer_time + startTime
        // => 0 = markerTimeOnLayer + startTime
        // => startTime = -markerTimeOnLayer
        layer.startTime = -markerTimeOnLayer;

        // Re-pin inPoint and outPoint to comp boundaries
        layer.inPoint  = 0;
        layer.outPoint = comp.duration;

        app.endUndoGroup();

        dlg.close();
    };

    dlg.show();
})();
