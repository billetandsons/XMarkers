(function() {

    // ── Dialog ────────────────────────────────────────────────────────────────
    var dlg = new Window("dialog", "AB_MarkerLayer");
    dlg.orientation = "column";
    dlg.alignChildren = "fill";

    // Interval
    var grpInterval = dlg.add("group");
    grpInterval.add("statictext", undefined, "Marker interval (seconds):");
    var intervalField = grpInterval.add("edittext", undefined, "10");
    intervalField.characters = 6;

    // Total duration
    var grpDur = dlg.add("group");
    grpDur.add("statictext", undefined, "Total duration (seconds):");
    var durField = grpDur.add("edittext", undefined, "210");
    durField.characters = 6;

    // FPS
    var grpFps = dlg.add("group");
    grpFps.add("statictext", undefined, "Frame rate:");
    var fpsDrop = grpFps.add("dropdownlist", undefined, ["23.976", "24", "25", "29.97", "30"]);
    fpsDrop.selection = 0;

    // Comp name (only used if no active comp)
    var grpName = dlg.add("group");
    grpName.add("statictext", undefined, "New comp name (if needed):");
    var nameField = grpName.add("edittext", undefined, "MARKERS");
    nameField.characters = 20;

    // Buttons
    var grpBtn = dlg.add("group");
    grpBtn.alignment = "center";
    var btnOK     = grpBtn.add("button", undefined, "Build");
    var btnCancel = grpBtn.add("button", undefined, "Cancel");

    btnCancel.onClick = function() { dlg.close(); };

    btnOK.onClick = function() {

        var interval = parseInt(intervalField.text, 10);
        var totalDur = parseInt(durField.text, 10);
        var fpsStr   = fpsDrop.selection.text;
        var fpsMap   = { "23.976": 24000/1001, "24": 24, "25": 25, "29.97": 30000/1001, "30": 30 };
        var fpsInt   = { "23.976": 24, "24": 24, "25": 25, "29.97": 30, "30": 30 };
        var fps      = fpsMap[fpsStr];
        var fpsI     = fpsInt[fpsStr];

        if (isNaN(interval) || interval <= 0 || isNaN(totalDur) || totalDur <= 0) {
            alert("Please enter valid numbers for interval and duration.");
            return;
        }

        var comp = app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) {
            comp = app.project.items.addComp(nameField.text, 1920, 1080, 1.0, totalDur, fps);
        }

        app.beginUndoGroup("AB_MarkerLayer");

        var al = comp.layers.addNull(totalDur);
        al.adjustmentLayer = true;
        al.name = "MARKERS";
        al.moveToBeginning();

        var mp = al.property("Marker");
        var fd = comp.frameDuration;
        var framesPerInterval = interval * fpsI; // clean integer frames

        var count = 0;
        for (var i = 0; i <= totalDur; i += interval) {
            var label    = (i < 10 ? "00" : i < 100 ? "0" : "") + i;
            var mv       = new MarkerValue(label);
            var frameNum = (i / interval) * framesPerInterval;
            var exactTime = frameNum * fd;
            if (exactTime > totalDur) break;
            mp.setValueAtTime(exactTime, mv);
            count++;
        }

        app.endUndoGroup();
        dlg.close();
        alert("Done — " + count + " markers added to MARKERS layer.");
    };

    dlg.show();

})();
