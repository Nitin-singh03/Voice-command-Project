import { useState, useRef, useEffect } from "react";
import { useVoice } from "../context/VoiceContext";

function WhiteUniverseShaderCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId;
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return;

    const vs = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fs = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      varying vec2 v_texCoord;

      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m; m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 g = (x - floor(x + 0.5)) * vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw));
        return 130.0 * dot(m, g);
      }

      float fbm(vec2 p) {
        float f = 0.0;
        float w = 0.5;
        for (int i = 0; i < 5; i++) {
          f += w * snoise(p);
          p *= 2.02;
          w *= 0.5;
        }
        return f;
      }

      void main() {
        vec2 uv = (v_texCoord - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
        float t = u_time * 0.22;

        // Continuous Swirling Cosmic Vortex / Universe Movement
        float r = length(uv);
        float a = atan(uv.y, uv.x) + t * 0.25;
        vec2 st = vec2(r * cos(a), r * sin(a));

        float n = fbm(st * 3.0 + vec2(t * 0.15, t * 0.1));
        float particles = pow(clamp(snoise(v_texCoord * 35.0 + t * 0.4), 0.0, 1.0), 10.0) * 1.8;

        // White Light Cosmic Palette (Pure White Background + Dark Charcoal Cosmic Waves & Silver Stardust)
        vec3 pureWhite = vec3(0.99, 0.99, 1.0);
        vec3 cosmicCharcoal = vec3(0.15, 0.18, 0.22);
        vec3 stardustSilver = vec3(0.52, 0.24, 0.59); // Soft #843D96 tint

        vec3 cosmicCol = mix(pureWhite, cosmicCharcoal, clamp(n * 0.30, 0.0, 1.0));
        cosmicCol = mix(cosmicCol, stardustSilver, clamp(particles * 0.7, 0.0, 1.0));

        gl_FragColor = vec4(cosmicCol, 0.65);
      }
    `;

    function compileShader(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    }

    const program = gl.createProgram();
    gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vs));
    gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, "u_time");
    const uRes = gl.getUniformLocation(program, "u_resolution");
    const uMouse = gl.getUniformLocation(program, "u_mouse");

    const resize = () => {
      if (!canvas || !canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = rect.height - (e.clientY - rect.top);
    };
    window.addEventListener("mousemove", handleMouseMove);

    const render = (time) => {
      if (uTime) gl.uniform1f(uTime, time * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none rounded-[inherit]" />;
}

export default function VoiceOverlay() {
  const {
    voiceOverlayOpen,
    closeVoiceModal,
    isListening,
    startListening,
    stopListening,
    transcript,
    interimTranscript,
    isSpeaking,
    isProcessing,
    messages,
    currentLang,
    setCurrentLang,
    voiceMuted,
    setVoiceMuted,
  } = useVoice();

  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!voiceOverlayOpen) return;
    let growing = true;
    const interval = setInterval(() => {
      setScale((prev) => {
        if (growing) {
          if (prev >= 1.05) growing = false;
          return prev + 0.01;
        } else {
          if (prev <= 0.95) growing = true;
          return prev - 0.01;
        }
      });
    }, 60);
    return () => clearInterval(interval);
  }, [voiceOverlayOpen]);

  if (!voiceOverlayOpen) return null;

  // Extract exactly ONE previous user query & ONE previous assistant response
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
  const lastAssistantMsg = [...messages].reverse().find((m) => m.role === "assistant" && m.id !== "init-1");

  const getDisplayText = () => {
    if (isProcessing) return "Synthesizing...";
    if (isSpeaking) return "Speaking...";
    if (isListening) {
      if (interimTranscript || transcript) return interimTranscript || transcript;
      return "Listening...";
    }
    return "Say 'Hello Lumina'...";
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/10 backdrop-blur-none p-4 sm:p-6 select-none animate-fadeIn"
      onClick={closeVoiceModal}
    >
      {/* Pure White Cosmic Glass Box with Morphing Orb Opening & Luminating Border featuring #843d9659 */}
      <div
        className="relative w-full max-w-xl min-h-[500px] rounded-[2.5rem] p-6 sm:p-8 flex flex-col justify-between items-center bg-white/90 backdrop-blur-2xl border border-white/95 shadow-[0_20px_70px_rgba(132,61,150,0.18)] animate-[smoothMorphOrb_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards] overflow-hidden text-stone-900 group will-change-transform"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Illuminating Outer Light Border Ring with #843d9659 */}
        <div
          className="absolute -inset-[2px] rounded-[2.6rem] bg-gradient-to-r from-[#843D96] via-stone-400 to-[#843D96] opacity-75 blur-md animate-[borderLuminate_4s_linear_infinite] pointer-events-none -z-10"
          style={{ borderColor: "#843d9659" }}
        />

        {/* Continuous Swirling White Universe Shader Canvas */}
        <WhiteUniverseShaderCanvas />

        {/* Top Controls Bar */}
        <div className="w-full flex justify-between items-center z-30 relative pt-1">
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xl px-3.5 py-1.5 rounded-full border shadow-xs" style={{ borderColor: "#843d9659" }}>
            <span className="material-symbols-outlined text-[18px] animate-pulse" style={{ color: "#843D96" }}>auto_awesome</span>
            <span className="text-xs font-bold tracking-wider text-stone-900 uppercase">Lumina Voice AI</span>
          </div>

          <div className="flex items-center gap-2.5">
            <select
              value={currentLang}
              onChange={(e) => setCurrentLang(e.target.value)}
              className="bg-white/90 backdrop-blur-xl border border-stone-200 rounded-full text-xs font-semibold px-3 py-1.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#843D96] shadow-xs"
            >
              <option value="en-US">English (US)</option>
              <option value="hi-IN">हिन्दी (Hindi)</option>
            </select>

            <button
              onClick={() => setVoiceMuted(!voiceMuted)}
              title={voiceMuted ? "Unmute Voice Response" : "Mute Voice Response"}
              className="p-2 rounded-full bg-white/90 backdrop-blur-xl border text-stone-800 hover:text-stone-950 hover:bg-white transition-all shadow-xs"
              style={{ borderColor: "#843d9659" }}
            >
              <span className="material-symbols-outlined text-base">
                {voiceMuted ? "volume_off" : "volume_up"}
              </span>
            </button>
          </div>
        </div>

        {/* Top Card: Displays EXACTLY ONE Previous User Query & Result */}
        <div className="w-full flex justify-center pt-3 z-20 relative">
          <div
            className="bg-white/95 backdrop-blur-2xl rounded-2xl p-4 w-full max-w-md flex flex-col gap-2 relative overflow-hidden transition-all duration-300 shadow-md border"
            style={{ borderColor: "#843d9659" }}
          >
            {/* User Query Row */}
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-stone-500 text-[18px]">account_circle</span>
              <p className="text-xs sm:text-sm text-stone-900 font-semibold truncate">
                {lastUserMsg ? lastUserMsg.text : "Say 'Hello Lumina' or state your command..."}
              </p>
            </div>

            {/* Assistant Response Row */}
            <div className="flex items-start gap-2.5 pt-2 border-t border-stone-200/80">
              <span className="material-symbols-outlined text-[18px] mt-[1px]" style={{ color: "#843D96" }}>auto_awesome</span>
              <p className="text-xs sm:text-sm text-stone-800 font-medium line-clamp-3 leading-relaxed">
                {lastAssistantMsg
                  ? lastAssistantMsg.text
                  : "I am ready for your next grocery command!"}
              </p>
            </div>
          </div>
        </div>

        {/* Center Cosmic AI Status Title */}
        <div className="flex-grow flex flex-col items-center justify-center relative z-20 my-auto">
          <div
            className="relative flex items-center justify-center transition-transform duration-300 ease-out"
            style={{ transform: `scale(${scale})` }}
          >
            <div
              className="absolute rounded-full blur-3xl animate-pulse pointer-events-none"
              style={{ width: "220px", height: "220px", backgroundColor: "#843d9659" }}
            />
            <div
              className="absolute rounded-full bg-stone-300/30 blur-2xl animate-pulse pointer-events-none"
              style={{ width: "160px", height: "160px", animationDelay: "0.5s" }}
            />

            <h1 className="text-2xl sm:text-4xl text-stone-950 font-bold tracking-wide text-center relative z-20 drop-shadow-[0_2px_10px_rgba(132,61,150,0.25)] px-4 max-w-md">
              {getDisplayText()}
            </h1>
          </div>

          {/* Sound Wave Bars with #843D96 accents */}
          <div className="mt-8 flex items-center justify-center gap-2 h-9">
            <div
              className={`w-1.5 bg-stone-900 rounded-full transition-all duration-300 ${
                isListening || isSpeaking || isProcessing ? "animate-[wave_1.2s_ease-in-out_infinite]" : "h-2 opacity-40"
              }`}
              style={{ height: "14px", animationDelay: "0.1s" }}
            />
            <div
              className={`w-1.5 rounded-full transition-all duration-300 ${
                isListening || isSpeaking || isProcessing ? "animate-[wave_1.2s_ease-in-out_infinite]" : "h-4 opacity-40"
              }`}
              style={{ height: "28px", animationDelay: "0.2s", backgroundColor: "#843D96" }}
            />
            <div
              className={`w-1.5 bg-stone-500 rounded-full transition-all duration-300 ${
                isListening || isSpeaking || isProcessing ? "animate-[wave_1.2s_ease-in-out_infinite]" : "h-3 opacity-40"
              }`}
              style={{ height: "20px", animationDelay: "0.3s" }}
            />
            <div
              className={`w-1.5 bg-stone-900 rounded-full transition-all duration-300 ${
                isListening || isSpeaking || isProcessing ? "animate-[wave_1.2s_ease-in-out_infinite]" : "h-6 opacity-40"
              }`}
              style={{ height: "36px", animationDelay: "0.4s" }}
            />
            <div
              className={`w-1.5 rounded-full transition-all duration-300 ${
                isListening || isSpeaking || isProcessing ? "animate-[wave_1.2s_ease-in-out_infinite]" : "h-3 opacity-40"
              }`}
              style={{ height: "22px", animationDelay: "0.5s", backgroundColor: "#843D96" }}
            />
            <div
              className={`w-1.5 bg-stone-900 rounded-full transition-all duration-300 ${
                isListening || isSpeaking || isProcessing ? "animate-[wave_1.2s_ease-in-out_infinite]" : "h-5 opacity-40"
              }`}
              style={{ height: "30px", animationDelay: "0.6s" }}
            />
            <div
              className={`w-1.5 bg-stone-500 rounded-full transition-all duration-300 ${
                isListening || isSpeaking || isProcessing ? "animate-[wave_1.2s_ease-in-out_infinite]" : "h-2 opacity-40"
              }`}
              style={{ height: "16px", animationDelay: "0.7s" }}
            />
          </div>
        </div>

        {/* Bottom Close Button */}
        <div className="w-full flex justify-center mt-auto pb-2 z-20 relative">
          <button
            onClick={closeVoiceModal}
            aria-label="Close Voice Assistant"
            className="bg-white/90 backdrop-blur-xl rounded-full w-14 h-14 flex items-center justify-center text-stone-800 hover:text-white hover:bg-rose-500 shadow-md active:scale-95 transition-all border"
            style={{ borderColor: "#843d9659" }}
          >
            <span className="material-symbols-outlined text-[28px] font-light">close</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes smoothMorphOrb {
          0% {
            width: 70px;
            height: 70px;
            min-height: 70px;
            border-radius: 9999px;
            opacity: 0;
            transform: scale(0.15);
            box-shadow: 0 0 60px rgba(132, 61, 150, 0.5), 0 0 100px rgba(255, 255, 255, 0.8);
          }
          60% {
            width: 340px;
            height: 340px;
            min-height: 340px;
            border-radius: 9999px;
            opacity: 0.9;
            transform: scale(0.95);
            box-shadow: 0 0 80px rgba(132, 61, 150, 0.35);
          }
          100% {
            width: 100%;
            max-width: 36rem;
            min-height: 500px;
            border-radius: 2.5rem;
            opacity: 1;
            transform: scale(1);
            box-shadow: 0 20px 70px rgba(132, 61, 150, 0.18);
          }
        }

        @keyframes borderLuminate {
          0%, 100% {
            opacity: 0.5;
            filter: drop-shadow(0 0 18px rgba(132, 61, 150, 0.4));
          }
          50% {
            opacity: 0.95;
            filter: drop-shadow(0 0 32px rgba(132, 61, 150, 0.7));
          }
        }

        @keyframes wave {
          0%, 100% { height: 10px; opacity: 0.5; }
          50% { height: 36px; opacity: 1; box-shadow: 0 0 12px rgba(132, 61, 150, 0.4); }
        }
      `}</style>
    </div>
  );
}
