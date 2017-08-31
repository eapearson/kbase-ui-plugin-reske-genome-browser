define([
    'kb_common/html',
    'knockout-plus'
], function(
    html,
    ko
) {
    'use string';

    var t = html.tag,
        div = t('div'),
        svg = t('svg'),
        defs = t('defs'),
        mask = t('mask'),
        circle = t('circle'),
        rect = t('rect'),
        line = t('line'),
        text = t('text');


    function buildRadial(arg) {
        // x, y, angle, length, label
        var x = arg.x;
        var y = arg.y;
        var angle = arg.angle;
        var length = arg.length;
        var label = arg.label;
        var fontSize = arg.fontSize;


        var x2 = x + length * Math.cos(angle * 2 * Math.PI);
        var y2 = y + length * Math.sin(angle * 2 * Math.PI);
        var xLabel = x + (length + fontSize) * Math.cos(angle * 2 * Math.PI);
        var yLabel = y + (length + fontSize) * Math.sin(angle * 2 * Math.PI);
        // adjust label to ensure does not bump against line.
        // In the upper half, bump it above the line.
        if (angle >= 0.5) {
            yLabel = y2 - fontSize / 2;
        } else {
            yLabel = y2 + fontSize / 2;
        }
        xLabel = x2;
        return [
            line({
                x1: x,
                y1: y,
                x2: x2,
                y2: y2,
                stroke: arg.color,
                strokeWidth: 4
            }),
            text({
                x: xLabel,
                y: yLabel,
                fontFamily: arg.fontFamily || 'monospace',
                fontSize: fontSize + 'px',
                textAnchor: 'middle'
            }, label)
        ];
    }

    // A radial line that only appears within a given 
    // concentric ring.
    function buildRadialSegment(arg) {
        // circle center
        var x = arg.x;
        var y = arg.y;
        var angle = arg.angle;
        var radius = arg.radius;
        var length = arg.length;
        // The radius defins the beginning of the line
        var xBegin = x + radius * Math.cos(angle * 2 * Math.PI);
        var yBegin = y + radius * Math.sin(angle * 2 * Math.PI);

        var xEnd = x + (radius + length) * Math.cos(angle * 2 * Math.PI);
        var yEnd = y + (radius + length) * Math.sin(angle * 2 * Math.PI);

        return [
            line({
                x1: xBegin,
                y1: yBegin,
                x2: xEnd,
                y2: yEnd,
                stroke: arg.color, //arg.color,
                strokeWidth: 4
            })
        ];
    }

    // a ring is a circle with a circle mask.
    function buildRing(arg) {
        var id = html.genId();
        var c = circle({
            cx: arg.x,
            cy: arg.y,
            r: arg.radius + arg.width,
            fill: arg.color,
            mask: 'url(#' + id + ')'
        });
        var m = mask({
            id: id,
        }, [
            rect({
                width: '100%',
                height: '100%',
                fill: 'white'
            }),
            circle({
                cx: arg.x,
                cy: arg.y,
                r: arg.radius,
                fill: 'black'
            })
        ]);
        return [c, defs(m)];
    }

    function GeneViewer(arg) {
        // var ringDefs = [{
        //     angle: 0.333,
        //     color: 'green'
        // }, {
        //     angle: 0.666,
        //     color: 'blue'
        // }, {
        //     angle: 1,
        //     color: 'red'
        // }];
        var ringWidth = arg.config.ringWidth;
        var minRadius = arg.config.minRadius;
        var x = 150;
        var y = 150;
        // var radial1 = buildRadial(x, y, 0.8, 100, 'My Label');
        // var radial2 = buildRadial(x, y, 0.5, 100, 'Other Label');

        // Build rings.

        var ringDefs = ['a', 'b', 'c'].map(function(id) {
            return {
                id: id,
                config: arg.config.predictions[id],
                data: arg.data.predictions[id]
            };
        });
        var rings = ringDefs.map(function(ring, index) {
            var radius = minRadius + index * ringWidth;
            return buildRing({
                x: x,
                y: y,
                radius: radius,
                color: ring.config.bandColor,
                width: ringWidth
            });
        });

        var segments = ringDefs.map(function(ring, index) {
            var radius = minRadius + index * ringWidth;
            return buildRadialSegment({
                x: x,
                y: y,
                angle: ring.data.value,
                radius: radius,
                length: ringWidth,
                color: ring.config.tickColor
            });
        });

        console.log('segments', segments);

        var radialCommunity = buildRadial({
            x: x,
            y: y,
            angle: arg.data.community.value,
            color: arg.data.community.color,
            length: arg.config.radialLength,
            label: arg.data.community.label,
            fontSize: arg.config.fontSize,
            fontFamily: arg.config.fontFamily
        });

        var radialKBase = buildRadial({
            x: x,
            y: y,
            angle: arg.data.kbase.value,
            color: arg.data.kbase.color,
            length: arg.config.radialLength,
            label: arg.data.kbase.label,
            fontSize: arg.config.fontSize,
            fontFamily: arg.config.fontFamily
        });

        // var radials = [

        // ];

        // var radialRight = buildRadial({
        //     x: x,
        //     y: y,
        //     angle: 1,
        //     length: 90,
        //     label: 'Right'
        // });
        // var radialUp = buildRadial({
        //     x: x,
        //     y: y,
        //     angle: 0.75,
        //     length: 90,
        //     label: 'Up'
        // });
        // var radialLeft = buildRadial({
        //     x: x,
        //     y: y,
        //     angle: 0.50,
        //     length: 90,
        //     label: 'Left'
        // });
        // var radialDown = buildRadial({
        //     x: x,
        //     y: y,
        //     angle: 0.25,
        //     length: 90,
        //     label: 'Down'
        // });

        var center = circle({
            cx: x,
            cy: y,
            r: 5,
            stroke: 'black'
        });
        return svg({
            width: 300,
            height: 300,
            style: {
                outline: '1px silver solid',
                margin: '10px'
            }
        }, [rings, segments, radialKBase, radialCommunity, center]);
    }

    return GeneViewer;
});