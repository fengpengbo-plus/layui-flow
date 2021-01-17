layui.define(['layer', 'form', 'table','jquery','zrender'],function(exports){
    let $ = layui.jquery,
        zrender = layui.zrender;
    let zr = null;
    let nodeModule = {
        id: 0,
        name: "",
        level: 1,
        index: 1,
    };
    let edgeModule = {
        id: 0,
        name: "",
        startId: 1,
        endId: 2
    };
    let nodes = [];
    let edges = [];
    let obj = {
        init: function(elementId){
            zr = zrender.init(document.getElementById(elementId));

            $("#" + elementId).on("click",function(event){
                // TODO 画布空白处单击事件
                let x = event.offsetX;
                let y = event.offsetY;
                nodes.forEach(function (node) {
                    if (!node.contain(x,y)) {
                        node.attr({
                            style: {
                                stroke: '#f2f2f2'
                            }
                        });
                    }
                });
            });
            let dragCanvas = false;
            let dragStartX = 0;
            let dragStartY = 0;
            $("#" + elementId).mousemove(function (event) {
                // TODO 画布鼠标移动事件
                let x = event.offsetX;
                let y = event.offsetY;
                let moveX = (x-dragStartX);
                let moveY = (y-dragStartY);
                dragStartX = x;
                dragStartY = y;
                if (dragCanvas) {
                    nodes.forEach(function (node) {
                        node.attr({
                            shape: {
                                x: node.shape.x + moveX,
                                y: node.shape.y + moveY
                            }
                        })
                    });
                    edges.forEach(function (edge) {
                        edge.attr({
                            shape: {
                                x1: edge.shape.x1 + moveX,
                                y1: edge.shape.y1 + moveY,
                                x2: edge.shape.x2 + moveX,
                                y2: edge.shape.y2 + moveY,
                                cpx1: edge.shape.cpx1 + moveX,
                                cpy1: edge.shape.cpy1 + moveY
                            }
                        })
                    })
                }
            });
            $("#" + elementId).mousedown(function (event) {
                let x = event.offsetX;
                let y = event.offsetY;
                dragStartX = x;
                dragStartY = y;
                dragCanvas = true;
            });
            $("#" + elementId).mouseup(function (event) {
                dragCanvas = false;
            })

        }
        ,
        /**
         * 根据服务编排流程数据 绘制化画布
         * @param data
         */
        render: function(nodes,edges,nodeClickCallback,editClickCallback, edgeClickCallback) {
            if (nodes instanceof Array) {
                nodes.forEach(function (item) {
                    let addItem = createNode(item,nodeClickCallback, editClickCallback);
                    addItem.forEach(function(node){
                        zr.add(node);
                    });
                })
            }
            if (edges instanceof Array) {
                edges.forEach(function (item) {
                    let addItem = createEdge(item, edgeClickCallback);
                    addItem.forEach(function (edge) {
                        zr.add(edge);
                    })
                })
            }
        }
    };

    /**
     * 创建节点
     */
    function createNode(nodeData,nodeClickCallback,editClickCallback) {
        // node层级
        let level = nodeData.level;
        // node在同一个层级的顺序
        let index = nodeData.index;
        let g = new zrender.Group();
        let edit = new zrender.Circle({
            shape: {
                cx: 165 + 200 * (level - 1),
                cy: 13 + 50 * (index -1),
                r: 5
            },
            style: {
                fill: '#f2f2f2',
                stroke: 'grey'
            }
        }).on("click", function (event) {
            if (typeof editClickCallback === 'function')
                editClickCallback();
        });
        // edit.hide();
        let node = new zrender.Rect({
            id: nodeData.id,
            shape: {
                x: 5 + 200 * (level - 1),
                y: 2 + 50 * (index -1),
                r: [2,2,2,2],
                width: 150,
                height: 26
            },
            style: {
                fill: '#fff',
                stroke: '#f2f2f2'
            }
        }).on("click", function(event){
            if (typeof nodeClickCallback === 'function')
                nodeClickCallback();
            let x = event.offsetX;
            let y = event.offsetY;
            if (node.contain(x,y)) {
                this.attr({
                    style: {
                        stroke: '#cccccc'
                    }
                })
            }
        });
        let text = new zrender.Text({
            style: {
                text: nodeData.name,
                textPosition: 'inside'
            }
        });
        // nodes.push(edit);
        g.add(node);
        g.add(text);
        nodes.push(node);
        return nodes;
    }

    /**
     * 创建连线
     * @param data
     * @param edgeClickCallback
     */
    function createEdge(data, edgeClickCallback) {
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;
        let cpx1 = 0;
        let cpy1 = 0;
        let cpx2 = 0;
        let cpy2 = 0;
        nodes.forEach(function (node) {
            let boundRect = node.getBoundingRect();
            let x = boundRect.x;
            let y = boundRect.y;
            let width = boundRect.width;
            let height = boundRect.height;
            if (node.id == data.startId) {
                startX = x + width;
                startY = y + height/2;
            }
            if (node.id == data.endId) {
                endX = x;
                endY = y + height/2;
            }
        });
        cpx1 = startX + (endX - startX)/2 + 10;
        cpy1 = startY + (endY - startY)/2;
        cpx2 = cpx1 - 10;
        cpy2 = cpy1;

        let edge = new zrender.BezierCurve({
            shape: {
                x1: startX,
                y1: startY,
                x2: endX,
                y2: endY,
                cpx1: cpx1,
                cpy1: cpy1,
                // cpx2: cpx2,
                // cpy2: cpy2
            }
        });
        edges.push(edge);
        return edges;
    }

    exports('layFlow', obj);
});
