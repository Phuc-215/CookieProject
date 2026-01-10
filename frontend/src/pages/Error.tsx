import error from "../assets/error.svg"; 

export function Error() {
  return (
    <div className="min-h-screen bg-[var(--background-image)]">
      <section className="max-w-5xl mx-auto px-4 py-16 flex justify-center">
        <div className="pixel-card bg-white p-8 md:p-12 text-center w-full max-w-2xl">

          <div className="inline-block w-32 h-32 relative mb-6">
            <img
              src={error}
              alt="Error"
              className="w-full h-full object-contain"
            />
          </div>

          <h2
            className="text-xl md:text-xl mb-4 text-[var(--choco)]"
            style={{ fontFamily: "'Press Start 2P', cursive" }}
          >404: The page ran away. </h2>

          <p className="text-lg text-[var(--choco)] leading-relaxed max-w-md mx-auto">
            We’re chasing it!
          </p>

        </div>
      </section>
    </div>
  );
}