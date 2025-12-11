import { jsxDEV } from "react/jsx-dev-runtime";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Player } from "@websim/remotion/player";
import { BingoCardClip } from "./composition.jsx";
const exampleCard = [
  ["1", "18", "31", "48", "63"],
  ["2", "16", "30", "52", "66"],
  ["5", "20", "FREE", "57", "72"],
  ["12", "21", "39", "51", "68"],
  ["7", "24", "34", "46", "70"]
];
function HeaderSmall() {
  const letters = ["B", "I", "N", "G", "O"];
  return (
    // Render the letters in a matching grid so they align with the 5x5 numbers
    /* @__PURE__ */ jsxDEV("div", { style: { display: "grid", gridTemplateColumns: "repeat(5, 92px)", gap: 8, justifyContent: "center", marginBottom: 12 }, children: letters.map((L) => /* @__PURE__ */ jsxDEV(
      "div",
      {
        style: {
          width: 92,
          height: 92,
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
          border: `4px solid #2b2b2b`,
          // header thicker outline to match composition
          fontSize: 48,
          fontWeight: 900,
          // bolder letters
          color: "#1b1b1b",
          fontFamily: "Arial, Helvetica, sans-serif"
        },
        children: L
      },
      L,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 22,
        columnNumber: 9
      },
      this
    )) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 20,
      columnNumber: 5
    }, this)
  );
}
function BingoCage({ size = 220 }) {
  const ref = useRef(null);
  const [balls, setBalls] = useState(
    () => (
      // create 10 balls with random positions inside circle
      new Array(10).fill(0).map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * 0.45;
        return {
          id: i,
          x: 0.5 + r * Math.cos(angle) * 0.4,
          y: 0.5 + r * Math.sin(angle) * 0.4,
          vx: (Math.random() - 0.5) * 6e-3,
          vy: (Math.random() - 0.5) * 6e-3,
          color: ["#ff6b6b", "#ffd54f", "#6bcfff", "#9bff9b", "#ff9bd6"][i % 5],
          number: 1 + Math.floor(Math.random() * 75)
        };
      })
    )
  );
  const animRef = useRef(null);
  const spinRef = useRef({ spinning: false, angle: 0, angularVel: 0 });
  useEffect(() => {
    let last = performance.now();
    function step(now) {
      const dt = Math.min(50, now - last);
      last = now;
      setBalls((prev) => {
        const next = prev.map((b) => ({ ...b }));
        const center = { x: 0.5, y: 0.5 };
        const spin = spinRef.current;
        for (const b of next) {
          const dx = b.x - center.x;
          const dy = b.y - center.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1e-3;
          const push = spin.angularVel * 0.02;
          b.vx += dx / dist * push * (dt / 16);
          b.vy += dy / dist * push * (dt / 16);
          b.vy += 5e-5 * (dt / 16);
          b.x += b.vx * (dt / 16);
          b.y += b.vy * (dt / 16);
          const rx = b.x - center.x;
          const ry = b.y - center.y;
          const rdist = Math.sqrt(rx * rx + ry * ry);
          const maxR = 0.48;
          if (rdist > maxR) {
            const nx = rx / rdist;
            const ny = ry / rdist;
            b.x = center.x + nx * maxR;
            b.y = center.y + ny * maxR;
            const vn = b.vx * nx + b.vy * ny;
            b.vx -= 1.6 * vn * nx;
            b.vy -= 1.6 * vn * ny;
            b.vx *= 0.95;
            b.vy *= 0.95;
          }
          b.vx *= 0.999;
          b.vy *= 0.999;
        }
        for (let i = 0; i < next.length; i++) {
          for (let j = i + 1; j < next.length; j++) {
            const a = next[i], b = next[j];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const d = Math.sqrt(dx * dx + dy * dy) || 1e-3;
            const minD = 0.07;
            if (d < minD) {
              const overlap = (minD - d) / 2;
              const nx = dx / d, ny = dy / d;
              a.x -= nx * overlap;
              a.y -= ny * overlap;
              b.x += nx * overlap;
              b.y += ny * overlap;
              const vx = (a.vx + b.vx) / 2;
              const vy = (a.vy + b.vy) / 2;
              a.vx = vx - nx * 2e-3;
              a.vy = vy - ny * 2e-3;
              b.vx = vx + nx * 2e-3;
              b.vy = vy + ny * 2e-3;
            }
          }
        }
        return next;
      });
      if (spinRef.current.angularVel !== 0) {
        spinRef.current.angularVel *= 0.995;
        if (Math.abs(spinRef.current.angularVel) < 1e-4) spinRef.current.angularVel = 0;
      }
      animRef.current = requestAnimationFrame(step);
    }
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, []);
  const handleTap = () => {
    spinRef.current.spinning = true;
    spinRef.current.angularVel = (Math.random() * 0.02 + 0.01) * (Math.random() > 0.5 ? 1 : -1);
    setBalls((prev) => prev.map((b) => ({
      ...b,
      vx: b.vx + (Math.random() - 0.5) * 0.01,
      vy: b.vy + (Math.random() - 0.5) * 0.01 - 5e-3
    })));
    const el = ref.current;
    if (!el) return;
    el.style.transition = "transform 900ms cubic-bezier(.2,.9,.2,1)";
    const rotateBy = (Math.random() > 0.5 ? 720 : -720) + Math.floor(Math.random() * 360);
    el.style.transform = `rotate(${rotateBy}deg)`;
    setTimeout(() => {
      el.style.transition = "";
      el.style.transform = `rotate(0deg)`;
    }, 900);
  };
  return /* @__PURE__ */ jsxDEV("div", { style: { width: size, height: size + 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }, children: [
    /* @__PURE__ */ jsxDEV(
      "div",
      {
        ref,
        onClick: handleTap,
        title: "Tap to spin",
        style: {
          width: size,
          height: size,
          borderRadius: "50%",
          background: "transparent",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer"
        },
        children: [
          /* @__PURE__ */ jsxDEV("svg", { width: size, height: size, viewBox: "0 0 200 200", style: { position: "absolute", left: 0, top: 0 }, children: [
            /* @__PURE__ */ jsxDEV("defs", { children: /* @__PURE__ */ jsxDEV("linearGradient", { id: "metal", x1: "0", x2: "1", children: [
              /* @__PURE__ */ jsxDEV("stop", { offset: "0", stopColor: "#dfe6ea" }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 208,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("stop", { offset: "1", stopColor: "#bfc7cc" }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 209,
                columnNumber: 15
              }, this)
            ] }, void 0, true, {
              fileName: "<stdin>",
              lineNumber: 207,
              columnNumber: 13
            }, this) }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 206,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ jsxDEV("circle", { cx: "100", cy: "100", r: "96", fill: "url(#metal)", stroke: "#8b9094", strokeWidth: "3" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 212,
              columnNumber: 11
            }, this),
            [...Array(6)].map((_, i) => {
              const y = 30 + i * 24;
              return /* @__PURE__ */ jsxDEV("ellipse", { cx: "100", cy: y, rx: 82, ry: 12, fill: "none", stroke: "#6b6f73", strokeWidth: "2", opacity: "0.7" }, i, false, {
                fileName: "<stdin>",
                lineNumber: 216,
                columnNumber: 20
              }, this);
            }),
            [...Array(8)].map((_, i) => {
              const x = 30 + i * 20;
              return /* @__PURE__ */ jsxDEV("ellipse", { cx: x, cy: 100, rx: 12, ry: 82, fill: "none", stroke: "#6b6f73", strokeWidth: "2", opacity: "0.7" }, `v${i}`, false, {
                fileName: "<stdin>",
                lineNumber: 221,
                columnNumber: 20
              }, this);
            }),
            /* @__PURE__ */ jsxDEV("rect", { x: "96", y: "0", width: "8", height: "40", fill: "#6b6f73", rx: "2" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 224,
              columnNumber: 11
            }, this)
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 205,
            columnNumber: 9
          }, this),
          /* @__PURE__ */ jsxDEV("div", { style: {
            width: size,
            height: size,
            borderRadius: "50%",
            position: "absolute",
            overflow: "hidden",
            pointerEvents: "none"
          }, children: balls.map((b) => {
            const px = b.x * size - size * 0.06;
            const py = b.y * size - size * 0.06;
            const ballSize = Math.round(size * 0.12);
            return /* @__PURE__ */ jsxDEV("div", { style: {
              position: "absolute",
              left: px,
              top: py,
              width: ballSize,
              height: ballSize,
              borderRadius: 999,
              background: b.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#222",
              fontSize: Math.max(10, Math.round(ballSize * 0.42)),
              fontWeight: 800,
              boxShadow: "0 4px 8px rgba(0,0,0,0.18)",
              border: "2px solid rgba(255,255,255,0.6)",
              transform: "translate(-50%,-50%)"
            }, children: b.number }, b.id, false, {
              fileName: "<stdin>",
              lineNumber: 241,
              columnNumber: 15
            }, this);
          }) }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 228,
            columnNumber: 9
          }, this),
          /* @__PURE__ */ jsxDEV("div", { style: {
            position: "absolute",
            bottom: -26,
            width: size * 0.6,
            height: 24,
            background: "#6b6f73",
            borderRadius: 8,
            transform: "translateY(50%)",
            boxShadow: "0 6px 12px rgba(0,0,0,0.12)"
          } }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 266,
            columnNumber: 9
          }, this)
        ]
      },
      void 0,
      true,
      {
        fileName: "<stdin>",
        lineNumber: 188,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 12, color: "#444" }, children: "Tap cage to spin" }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 278,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 187,
    columnNumber: 5
  }, this);
}
function InteractiveApp() {
  const [actions, setActions] = useState([]);
  const [playerKey, setPlayerKey] = useState(0);
  const [isReplayMode, setIsReplayMode] = useState(false);
  const handleCellTap = (r, c) => {
    const t = Date.now();
    const next = [...actions, { r, c, t }];
    setActions(next);
  };
  const clearActions = () => {
    setActions([]);
    setIsReplayMode(false);
    setPlayerKey((k) => k + 1);
  };
  const matchForPlayer = useMemo(() => {
    if (!isReplayMode) return { card: exampleCard, highlights: [], durationInFrames: 150 };
    if (actions.length === 0) return { card: exampleCard, highlights: [], durationInFrames: 150 };
    const sorted = [...actions].sort((a, b) => a.t - b.t);
    const t0 = sorted[0].t;
    const actionsWithFrame = sorted.map((a, idx) => {
      const msOffset = a.t - t0;
      const frameFromTime = Math.round(msOffset / 1e3 * 30);
      const frame = Math.max(0, frameFromTime + idx * 6);
      return { r: a.r + 1, c: a.c, frame };
    });
    const maxFrame = actionsWithFrame.reduce((m, a) => Math.max(m, a.frame), 0);
    const durationInFrames = Math.max(150, maxFrame + 30);
    const lettersRow = ["B", "I", "N", "G", "O"];
    const cardWithHeader = [lettersRow, ...exampleCard];
    return { card: cardWithHeader, replayActions: actionsWithFrame, durationInFrames };
  }, [isReplayMode, actions]);
  return /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", height: "100%", gap: 12, alignItems: "center", padding: 12, boxSizing: "border-box", justifyContent: "center" }, children: [
    /* @__PURE__ */ jsxDEV("div", { style: { width: 360, boxSizing: "border-box", background: "#fff", borderRadius: 12, padding: 12 }, children: /* @__PURE__ */ jsxDEV("div", { style: {
      width: "100%",
      height: 640,
      marginTop: 8,
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      background: "#fafafa",
      borderRadius: 12,
      boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
      overflow: "hidden"
    }, children: /* @__PURE__ */ jsxDEV("div", { style: {
      width: 620,
      padding: 18,
      borderRadius: 20,
      background: "#fff",
      transform: "scale(0.55)",
      transformOrigin: "center center",
      boxSizing: "content-box",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 12
    }, children: [
      /* @__PURE__ */ jsxDEV(BingoCage, { size: 220 }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 356,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV(HeaderSmall, {}, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 359,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV("div", { style: { display: "grid", gridTemplateColumns: "repeat(5, 92px)", gap: 8, justifyContent: "center", marginTop: 6 }, children: exampleCard.map(
        (row, rIdx) => row.map((cell, cIdx) => {
          const isFree = typeof cell === "string" && cell.toLowerCase().includes("free");
          const tapped = actions.some((a) => a.r === rIdx && a.c === cIdx);
          return /* @__PURE__ */ jsxDEV(
            "button",
            {
              onClick: () => handleCellTap(rIdx, cIdx),
              style: {
                width: 92,
                height: 92,
                borderRadius: 12,
                border: "3px solid #2b2b2b",
                // match composition thicker outline for cells
                background: isFree ? "#efefef" : "#fff",
                fontWeight: 700,
                fontSize: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                cursor: "pointer",
                color: "#111",
                fontFamily: "Arial, Helvetica, sans-serif"
              },
              children: [
                tapped && /* @__PURE__ */ jsxDEV("div", { style: {
                  position: "absolute",
                  width: 74,
                  height: 74,
                  borderRadius: 999,
                  background: "#ff6b6b",
                  opacity: 0.95,
                  zIndex: 0
                } }, void 0, false, {
                  fileName: "<stdin>",
                  lineNumber: 389,
                  columnNumber: 25
                }, this),
                /* @__PURE__ */ jsxDEV("div", { style: { zIndex: 1, fontSize: 20 }, children: isFree ? "FREE" : cell }, void 0, false, {
                  fileName: "<stdin>",
                  lineNumber: 399,
                  columnNumber: 23
                }, this)
              ]
            },
            `${rIdx}-${cIdx}`,
            true,
            {
              fileName: "<stdin>",
              lineNumber: 367,
              columnNumber: 21
            },
            this
          );
        })
      ) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 360,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 342,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 330,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 328,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { style: { width: 360, height: 640, display: "flex", alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ jsxDEV("div", { style: { width: "100%", height: "100%", boxSizing: "border-box", borderRadius: 12, overflow: "hidden", boxShadow: "0 12px 36px rgba(0,0,0,0.12)" }, children: /* @__PURE__ */ jsxDEV(
      Player,
      {
        component: BingoCardClip,
        durationInFrames: matchForPlayer.durationInFrames || 150,
        fps: 30,
        compositionWidth: 1080,
        compositionHeight: 1920,
        loop: true,
        controls: true,
        inputProps: { match: matchForPlayer },
        autoplay: true,
        style: { width: "100%", height: "100%" }
      },
      playerKey + (isReplayMode ? "-replay" : ""),
      false,
      {
        fileName: "<stdin>",
        lineNumber: 414,
        columnNumber: 11
      },
      this
    ) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 413,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 412,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { style: { width: 360, boxSizing: "border-box", padding: 12, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }, children: [
      /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", gap: 8 }, children: [
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: () => {
              setIsReplayMode(true);
              setPlayerKey((k) => k + 1);
            },
            style: { padding: "8px 12px", borderRadius: 8, background: "#1b9fff", color: "#fff", border: "none", fontSize: 14 },
            children: "Render Replay"
          },
          void 0,
          false,
          {
            fileName: "<stdin>",
            lineNumber: 433,
            columnNumber: 11
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: clearActions,
            style: { padding: "8px 12px", borderRadius: 8, background: "#eee", border: "none", fontSize: 14 },
            children: "Clear"
          },
          void 0,
          false,
          {
            fileName: "<stdin>",
            lineNumber: 439,
            columnNumber: 11
          },
          this
        )
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 432,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { style: { width: "100%", fontSize: 12 }, children: [
        /* @__PURE__ */ jsxDEV("div", { style: { fontWeight: 700, marginBottom: 6 }, children: "Recorded actions JSON" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 448,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("pre", { style: { whiteSpace: "pre-wrap", wordBreak: "break-word", background: "#f7f7f7", padding: 8, borderRadius: 6, maxHeight: 420, overflow: "auto" }, children: JSON.stringify(actions, null, 2) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 449,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 447,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 431,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 326,
    columnNumber: 5
  }, this);
}
createRoot(document.getElementById("app")).render(/* @__PURE__ */ jsxDEV(InteractiveApp, {}, void 0, false, {
  fileName: "<stdin>",
  lineNumber: 458,
  columnNumber: 51
}));
