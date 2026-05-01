import { useEffect, useRef, useState } from "react";
import { useBrain } from "../context/BrainContext";
import * as d3 from "d3";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";

export default function GraphView() {
  const { notes, setActiveNote } = useBrain();
  const svgRef = useRef();
  const containerRef = useRef();
  const [zoomLevel, setZoomLevel] = useState(1);

  // Parse links from content [[title]]
  const getLinks = (note) => {
    if (!note.content) return [];
    const linkRegex = /\[\[(.*?)\]\]/g;
    const links = [];
    let match;
    while ((match = linkRegex.exec(note.content)) !== null) {
      const linkedTitle = match[1].toLowerCase();
      const targetNode = notes.find(n => n.title.toLowerCase() === linkedTitle);
      if (targetNode) {
        links.push({ source: note.id, target: targetNode.id });
      }
    }
    return links;
  };

  useEffect(() => {
    if (!notes.length || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    // Zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (e) => {
        g.attr("transform", e.transform);
        setZoomLevel(e.transform.k);
      });

    svg.call(zoom);

    // Create a background rectangle to catch drag events
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "transparent");

    const g = svg.append("g");

    const nodes = notes.map((n) => ({ id: n.id, title: n.title, tag: n.tags?.[0] }));
    const links = [];
    
    notes.forEach((n) => {
      links.push(...getLinks(n));
      // Fallback for old manual links
      (n.links || []).forEach((linkedId) => {
        if (!links.some(l => l.source === n.id && l.target === linkedId)) {
           links.push({ source: n.id, target: linkedId });
        }
      });
    });

    // Tag colors mapping
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d) => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(40));

    // Glow filter
    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    const link = g.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "var(--accent-glow)")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.6);

    const node = g.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .style("cursor", "pointer")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
      .on("click", (event, d) => {
        const note = notes.find((n) => n.id === d.id);
        setActiveNote(note);
      });

    node.append("circle")
      .attr("r", 24)
      .attr("fill", d => d.tag ? colorScale(d.tag) : "var(--bg-glass)")
      .attr("stroke", d => d.tag ? colorScale(d.tag) : "var(--border-color)")
      .attr("stroke-width", 3)
      .style("filter", "url(#glow)");

    // Tooltip
    node.append("title")
      .text(d => `${d.title || "Untitled"}\nTag: ${d.tag || "None"}`);

    node.append("text")
      .text((d) => d.title ? d.title.slice(0, 15) + (d.title.length > 15 ? "..." : "") : "Untitled")
      .attr("text-anchor", "middle")
      .attr("dy", 40)
      .attr("fill", "var(--text-primary)")
      .attr("font-size", "12px")
      .attr("font-weight", "500")
      .attr("font-family", "Inter")
      .style("pointer-events", "none")
      .style("text-shadow", "0 2px 4px rgba(0,0,0,0.8)");

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);
      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Expose zoom function
    window.zoomGraph = (type) => {
      if (type === 'in') svg.transition().duration(300).call(zoom.scaleBy, 1.3);
      else if (type === 'out') svg.transition().duration(300).call(zoom.scaleBy, 0.7);
      else svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
    };

    const handleResize = () => {
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      svg.attr("width", w).attr("height", h);
      simulation.force("center", d3.forceCenter(w / 2, h / 2));
      simulation.alpha(0.3).restart();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);

  }, [notes, setActiveNote]);

  if (!notes.length) {
    return (
      <div className="animate-fade-in" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "24px", background: "var(--bg-glass)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-md)" }}>
            <span style={{ fontSize: "40px" }}>🕸️</span>
          </div>
          <div>
            <h3 style={{ fontSize: "18px", color: "var(--text-primary)", fontWeight: "500", marginBottom: "8px" }}>Empty Graph</h3>
            <p style={{ fontSize: "14px" }}>Create notes and link them using [[title]] syntax to see your graph.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="animate-fade-in" style={{ position: "relative", width: "100%", height: "100%", background: "radial-gradient(circle at center, var(--bg-secondary) 0%, var(--bg-primary) 100%)" }}>
      
      {/* Controls Overlay */}
      <div style={{ position: "absolute", bottom: "24px", right: "24px", display: "flex", flexDirection: "column", gap: "8px", zIndex: 10 }}>
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", borderRadius: "12px", overflow: "hidden", boxShadow: "var(--shadow-md)" }}>
          <button className="button-base" onClick={() => window.zoomGraph('in')} style={{ padding: "12px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "center", alignItems: "center" }} onMouseEnter={(e) => e.target.style.background="var(--bg-glass-active)"} onMouseLeave={(e) => e.target.style.background="transparent"}>
            <ZoomIn size={18} />
          </button>
          <button className="button-base" onClick={() => window.zoomGraph('out')} style={{ padding: "12px", display: "flex", justifyContent: "center", alignItems: "center" }} onMouseEnter={(e) => e.target.style.background="var(--bg-glass-active)"} onMouseLeave={(e) => e.target.style.background="transparent"}>
            <ZoomOut size={18} />
          </button>
        </div>
        <button className="button-base glass-panel" onClick={() => window.zoomGraph('reset')} style={{ padding: "12px", borderRadius: "12px", display: "flex", justifyContent: "center", alignItems: "center", boxShadow: "var(--shadow-md)" }} onMouseEnter={(e) => e.target.style.background="var(--bg-glass-active)"} onMouseLeave={(e) => e.target.style.background="transparent"}>
          <Maximize size={18} />
        </button>
      </div>
      
      {/* Graph Status Indicator */}
      <div style={{ position: "absolute", top: "24px", left: "24px", zIndex: 10 }}>
        <div className="glass-panel" style={{ padding: "8px 16px", borderRadius: "100px", fontSize: "12px", fontWeight: "500", display: "flex", alignItems: "center", gap: "8px", boxShadow: "var(--shadow-md)" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--success-color)", boxShadow: "0 0 8px var(--success-color)" }}></div>
          {notes.length} Nodes • {(zoomLevel * 100).toFixed(0)}% Zoom
        </div>
      </div>

      <svg ref={svgRef} style={{ width: "100%", height: "100%", outline: "none" }} />
    </div>
  );
}