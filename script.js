// --- CONFIGURATION ---
const PREFS = ["📍 Must Visits", "🍕 Foodie", "💎 Hidden Gems", "🌿 Nature", "🏛️ History", "🛍️ Shopping", "🎨 Arts", "🍸 Nightlife"];
const DAYS_OPTIONS = [1, 2, 3, 4, 5, 7];
const DAY_COLORS = ["#000000", "#F97316", "#3B82F6", "#10B981", "#8B5CF6", "#EC4899", "#EAB308"];

const { useState, useEffect, useRef } = React;

// --- COMPONENT: PARTICLE BACKGROUND ---
function ParticleBackground() {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width, height, particles = [];
        const resize = () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; };
        window.addEventListener('resize', resize);
        resize();
        class Particle {
            constructor() {
                this.x = Math.random() * width; this.y = Math.random() * height;
                this.size = Math.random() * 2 + 0.5; this.speedY = Math.random() * 0.5 + 0.1;
                this.opacity = Math.random() * 0.3 + 0.1;
            }
            update() { this.y -= this.speedY; if (this.y < 0) this.y = height; }
            draw() { ctx.fillStyle = `rgba(0, 0, 0, ${this.opacity})`; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); }
        }
        for(let i=0; i<60; i++) particles.push(new Particle());
        const animate = () => { ctx.clearRect(0, 0, width, height); particles.forEach(p => { p.update(); p.draw(); }); requestAnimationFrame(animate); };
        animate();
        return () => window.removeEventListener('resize', resize);
    }, []);
    return <canvas ref={canvasRef} id="particle-canvas" />;
}

// --- COMPONENT: DASHBOARD ---
function Dashboard({ trip, reset }) {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    useEffect(() => {
        if(!mapInstance.current && mapRef.current) {
            mapInstance.current = L.map(mapRef.current).setView([trip.center_lat, trip.center_lon], 13);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; CARTO' }).addTo(mapInstance.current);
        }
        trip.days.forEach((day, index) => {
            const color = DAY_COLORS[index % DAY_COLORS.length];
            day.activities.forEach(act => {
                const customIcon = L.divIcon({
                    className: 'custom-pin',
                    html: `<div class="custom-marker" style="background-color: ${color}"><div>${day.day}</div></div>`,
                    iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -30]
                });
                L.marker(act.coords, { icon: customIcon }).addTo(mapInstance.current)
                    .bindPopup(`<b>${act.name}</b><br><span style="color:${color}">${day.day} - ${act.time}</span>`);
            });
        });
    }, [trip]);
    const flyTo = (coords) => { mapInstance.current.flyTo(coords, 16, { duration: 1.5 }); };
    return (
        <div className="dashboard-container fade-in">
            <div className="itinerary-sidebar">
                <div className="sidebar-header">
                    <button className="btn-nav" style={{paddingLeft:0}} onClick={reset}><i className="ri-arrow-left-line"></i> Start Over</button>
                    <h2 className="trip-title">{trip.trip_name}</h2>
                </div>
                <div className="itinerary-scroll">
                    {trip.days.map((d, idx) => {
                        const dayColor = DAY_COLORS[idx % DAY_COLORS.length];
                        return (
                            <div key={d.day}>
                                <div className="day-label" style={{color: dayColor}}>Day {d.day}</div>
                                {d.activities.map((act, i) => (
                                    <div key={i} className="place-card" style={{borderLeftColor: dayColor}} onClick={() => flyTo(act.coords)}>
                                        <div className="place-time">{act.time}</div>
                                        <div className="place-name">{act.name}</div>
                                        <div className="place-desc">{act.desc}</div>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="map-area"><div id="map" ref={mapRef}></div></div>
        </div>
    );
}

// --- COMPONENT: APP WIZARD ---
function App() {
    const [step, setStep] = useState(1);
    const [data, setData] = useState({ city: "", prefs: [], days: 3 });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const update = (k, v) => setData(prev => ({...prev, [k]: v}));
    const togglePref = (p) => { setData(prev => ({...prev, prefs: prev.prefs.includes(p) ? prev.prefs.filter(x => x !== p) : [...prev.prefs, p] })); };

    const planTrip = async () => {
        setLoading(true);

        try {
            // CALL YOUR OWN BACKEND (No API Key needed here)
            const res = await fetch("/api/plan-trip", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data) // Send city, prefs, days
            });

            if (!res.ok) throw new Error("Server Error");
            const json = await res.json();
            setResult(json);

        } catch(e) {
            console.error(e);
            alert("Error generating trip. Please try again.");
        } finally { 
            setLoading(false); 
        }
    };

    if(result) return <Dashboard trip={result} reset={() => setResult(null)} />;

    return (
        <>
            <ParticleBackground />
            <div className="wizard-container">
                {step === 1 && (
                    <div className="fade-in-up">
                        <h1>Pack-n-Track</h1>
                        <p className="subtitle">Where are we going?</p>
                        <div className="search-box">
                            <i className="ri-search-line"></i>
                            <input autoFocus placeholder="e.g. Tokyo, Paris" value={data.city} onChange={e => update('city', e.target.value)} onKeyDown={e => e.key === 'Enter' && data.city && setStep(2)} />
                        </div>
                        <button className="btn-primary" onClick={() => data.city ? setStep(2) : alert("Enter a city")}>Let's Go <i className="ri-arrow-right-line"></i></button>
                    </div>
                )}
                {step === 2 && (
                    <div className="fade-in-up">
                        <h1>Preferences</h1>
                        <div className="grid-pills">
                            {PREFS.map(p => (
                                <div key={p} className={`pill ${data.prefs.includes(p) ? 'selected' : ''}`} onClick={() => togglePref(p)}>{p}</div>
                            ))}
                        </div>
                        <div className="nav-row">
                            <button className="btn-nav" onClick={() => setStep(1)}>Back</button>
                            <button className="btn-primary" style={{width:'auto', marginTop:0}} onClick={() => setStep(3)}>Next</button>
                        </div>
                    </div>
                )}
                {step === 3 && !loading && (
                    <div className="fade-in-up">
                        <h1>Duration</h1>
                        <div className="grid-pills" style={{marginBottom: '2rem'}}>
                            {DAYS_OPTIONS.map(d => (
                                <div key={d} className={`pill ${data.days === d ? 'selected' : ''}`} onClick={() => update('days', d)}>{d} Days</div>
                            ))}
                        </div>
                        <div className="nav-row">
                            <button className="btn-nav" onClick={() => setStep(2)}>Back</button>
                            <button className="btn-primary" style={{width:'auto', marginTop:0}} onClick={planTrip}><i className="ri-magic-line"></i> Generate Plan</button>
                        </div>
                    </div>
                )}
                {loading && (
                    <div className="fade-in" style={{textAlign:'center'}}>
                        <div className="loader-ring"></div>
                        <h2>Designing your trip...</h2>
                        <p className="subtitle">Pack-n-Track is finding the best spots in {data.city}</p>
                    </div>
                )}
            </div>
        </>
    );
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);