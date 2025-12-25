export default function TestStyles() {
    return (
        <div className="min-h-screen bg-slate-100 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <h1 className="text-4xl font-bold text-center mb-8">Test Tailwind + DaisyUI</h1>

                {/* Test Tailwind */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Test Tailwind CSS</h2>
                        <div className="flex gap-4">
                            <div className="w-20 h-20 bg-red-500"></div>
                            <div className="w-20 h-20 bg-blue-500"></div>
                            <div className="w-20 h-20 bg-green-500"></div>
                        </div>
                    </div>
                </div>

                {/* Test DaisyUI Buttons */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Test DaisyUI Buttons</h2>
                        <div className="flex gap-2 flex-wrap">
                            <button className="btn">Default</button>
                            <button className="btn btn-primary">Primary</button>
                            <button className="btn btn-secondary">Secondary</button>
                            <button className="btn btn-accent">Accent</button>
                            <button className="btn btn-info">Info</button>
                            <button className="btn btn-success">Success</button>
                            <button className="btn btn-warning">Warning</button>
                            <button className="btn btn-error">Error</button>
                        </div>
                    </div>
                </div>

                {/* Test DaisyUI Alert */}
                <div className="space-y-4">
                    <div className="alert alert-info">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>Alert info fonctionne !</span>
                    </div>

                    <div className="alert alert-success">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Alert success fonctionne !</span>
                    </div>
                </div>

                {/* Test Input */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Test Inputs</h2>
                        <input type="text" placeholder="Type here" className="input input-bordered w-full" />
                        <input type="text" placeholder="Primary" className="input input-bordered input-primary w-full" />
                    </div>
                </div>

                {/* Badge */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Test Badges</h2>
                        <div className="flex gap-2">
                            <div className="badge">neutral</div>
                            <div className="badge badge-primary">primary</div>
                            <div className="badge badge-secondary">secondary</div>
                            <div className="badge badge-accent">accent</div>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-xl">Si vous voyez les couleurs et les styles DaisyUI, tout fonctionne ! ✅</p>
                </div>
            </div>
        </div>
    );
}

