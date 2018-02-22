let width = document.body.clientWidth;
let height = document.body.clientHeight;

width = 960;
height = 800;

let stage = new PIXI.Container();
let renderer = PIXI.autoDetectRenderer(width, height, 
{
  antialias: true,
  transparent: !0,
  resolution: 1,
});

document.body.appendChild(renderer.view);

let colour = (() => 
{
  let scale = d3.scaleOrdinal(d3.schemeCategory20);
  return (num) => parseInt(scale(num).slice(1), 16);
})();

let simulation = d3.forceSimulation()
  .force('link', d3.forceLink().id((d) => d.id))
  .force('charge', d3.forceManyBody())
  .force('center', d3.forceCenter(width / 2, height / 2));

d3.json('./dat/graphs/_g00.json', function(error, graph) {

  let links = new PIXI.Graphics();
  stage.addChild(links);

  graph.nodes.forEach((node) => {
    node.gfx = new PIXI.Graphics();
    node.gfx.lineStyle(3, 0xFFFFFF);
    node.gfx.beginFill(colour(node.group));
    node.gfx.drawCircle(0, 0, 4);
    stage.addChild(node.gfx);
  });

  d3.select(renderer.view)
    .call(d3.drag()
      .container(renderer.view)
      .subject(() => simulation.find(d3.event.x, d3.event.y))
      .on('start', drag)
      .on('drag', dragging)
      .on('end', dragged));


  simulation
    .nodes(graph.nodes)
    .on('tick', ticked);

  simulation.force('link')
    .links(graph.links);

  function ticked() {

    graph.nodes.forEach((node) => {
      let {
        x,
        y,
        gfx
      } = node;
      gfx.position = new PIXI.Point(x, y);
    });

    links.clear();
    links.alpha = 0.6;

    graph.links.forEach((link) => {
      let {
        source,
        target
      } = link;
      links.lineStyle(Math.sqrt(link.value), 0x999999);
      links.moveTo(source.x, source.y);
      links.lineTo(target.x, target.y);
    });

    links.endFill();

    renderer.render(stage);

  }
});

function drag() {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d3.event.subject.fx = d3.event.subject.x;
  d3.event.subject.fy = d3.event.subject.y;
}

function dragging() {
  d3.event.subject.fx = d3.event.x;
  d3.event.subject.fy = d3.event.y;
}

function dragged() {
  if (!d3.event.active) simulation.alphaTarget(0);
  d3.event.subject.fx = null;
  d3.event.subject.fy = null;
}