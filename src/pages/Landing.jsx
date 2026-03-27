import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

function Landing() {
  const navigate = useNavigate()

  const featuredPackages = [
    {
      title: "Goa Beach Escape",
      destination: "Goa, India",
      price: "₹12,999",
      days: "4 Days / 3 Nights",
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
      description:
        "Relax on golden beaches, enjoy sunsets, and experience a vibrant coastal getaway.",
    },
    {
      title: "Manali Adventure",
      destination: "Manali, Himachal",
      price: "₹15,999",
      days: "5 Days / 4 Nights",
      image:
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80",
      description:
        "A refreshing hill escape with scenic valleys, mountain air, and adventure-filled moments.",
    },
    {
      title: "Kerala Backwaters",
      destination: "Alleppey, Kerala",
      price: "₹10,999",
      days: "3 Days / 2 Nights",
      image:
        "https://images.unsplash.com/photo-1526779259212-939e64788e3c?auto=format&fit=crop&w=1400&q=80",
      description:
        "Cruise through peaceful backwaters and enjoy the beauty of God’s Own Country.",
    },
  ]

  const travelTypes = [
    "Beach",
    "Hill Station",
    "Heritage",
    "Adventure",
    "Pilgrimage",
    "Honeymoon",
    "Family",
    "Weekend",
    "International",
    "Budget",
  ]

  const stats = [
    { value: "10K+", label: "Happy Travelers" },
    { value: "500+", label: "Curated Packages" },
    { value: "100+", label: "Top Destinations" },
    { value: "24/7", label: "Support" },
  ]

  const features = [
    {
      title: "Trusted Travel Experience",
      text: "Carefully designed packages for smooth, comfortable, and memorable journeys.",
      icon: "🧳",
    },
    {
      title: "Easy Booking Flow",
      text: "Simple package discovery, quick booking process, and user-friendly experience.",
      icon: "📍",
    },
    {
      title: "Best Value Packages",
      text: "Affordable plans with clear details, transparent pricing, and quality service.",
      icon: "✨",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-sky-50 text-gray-800 overflow-hidden">
      <section className="relative min-h-[92vh] flex items-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80"
            alt="travel hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-900/45 to-sky-900/30"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, y: 45 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-white"
            >
              <div className="inline-flex items-center gap-2 mb-5 px-4 py-2 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-sm">
                <span>✈️</span>
                <span>Explore curated trips with Travelora</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Discover Your Next
                <span className="block bg-gradient-to-r from-blue-200 to-sky-300 bg-clip-text text-transparent">
                  Perfect Journey
                </span>
              </h1>

              <p className="mt-6 text-base sm:text-lg text-slate-200 max-w-2xl leading-relaxed">
                Travelora helps you explore destinations, compare curated
                packages, and plan memorable journeys with confidence. From beach
                holidays to mountain adventures, your next trip starts here.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  onClick={() => navigate("/register")}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-sky-500 text-white font-semibold hover:brightness-110 transition shadow-lg"
                >
                  Start Exploring
                </button>

                <a
                  href="#featured-packages"
                  className="px-6 py-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 text-white font-medium hover:bg-white/20 transition"
                >
                  View Packages
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 45 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85 }}
              className="lg:justify-self-end"
            >
              <div className="bg-white/20 backdrop-blur-xl border border-white/25 rounded-3xl p-5 sm:p-6 shadow-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 rounded-3xl overflow-hidden h-56 sm:h-64">
                    <img
                      src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"
                      alt="destination"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>

                  <div className="rounded-2xl overflow-hidden h-32 sm:h-36">
                    <img
                      src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80"
                      alt="mountains"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>

                  <div className="rounded-2xl overflow-hidden h-32 sm:h-36">
                    <img
                      src="https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1000&q=80"
                      alt="beach"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  {stats.slice(0, 4).map((item) => (
                    <div
                      key={item.label}
                      className="bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-white"
                    >
                      <div className="text-2xl font-bold">{item.value}</div>
                      <div className="text-sm text-slate-200">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-3xl shadow-lg p-5 sm:p-6"
        >
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white/50 rounded-2xl border border-white/40 px-4 py-4">
              <p className="text-sm text-gray-500 mb-1">Destination</p>
              <p className="font-semibold text-gray-800">Choose your dream place</p>
            </div>
            <div className="bg-white/50 rounded-2xl border border-white/40 px-4 py-4">
              <p className="text-sm text-gray-500 mb-1">Trip Type</p>
              <p className="font-semibold text-gray-800">Beach, Hill, Heritage</p>
            </div>
            <div className="bg-white/50 rounded-2xl border border-white/40 px-4 py-4">
              <p className="text-sm text-gray-500 mb-1">Best Packages</p>
              <p className="font-semibold text-gray-800">Curated for every traveler</p>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="rounded-2xl bg-gradient-to-r from-blue-500 to-sky-500 text-white font-semibold hover:brightness-110 transition px-4 py-4"
            >
              Explore Now
            </button>
          </div>
        </motion.div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <p className="text-blue-600 font-semibold mb-2">Travel Categories</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">
              Explore by Travel Type
            </h2>
            <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
              Find packages that match your mood, budget, and travel style.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {travelTypes.map((type, index) => (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.04, duration: 0.35 }}
                className="px-5 py-3 bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl shadow-sm text-gray-700 font-medium hover:-translate-y-1 hover:shadow-md transition-all"
              >
                {type}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <section id="featured-packages" className="max-w-7xl mx-auto px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <p className="text-blue-600 font-semibold mb-2">Featured Packages</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">
              Popular Destinations
            </h2>
            <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
              Handpicked travel experiences designed for memorable escapes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {featuredPackages.map((pkg, index) => (
              <motion.div
                key={pkg.title}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.45 }}
                className="group bg-white border border-gray-200 rounded-2xl shadow hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={pkg.image}
                    alt={pkg.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent"></div>
                  <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 text-sm font-semibold text-blue-600 shadow">
                    {pkg.price}
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-2 text-sm text-blue-600 font-medium">
                    {pkg.destination}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">{pkg.title}</h3>
                  <p className="text-sm text-gray-500 mt-2">{pkg.days}</p>
                  <p className="text-gray-600 mt-4 leading-relaxed text-sm">
                    {pkg.description}
                  </p>

                  <button
                    onClick={() => navigate("/login")}
                    className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-sky-500 text-white font-medium hover:brightness-110 transition"
                  >
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <section id="why-travelora" className="max-w-7xl mx-auto px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-blue-600 font-semibold mb-2">Why Choose Us</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">
            Built for Better Travel Planning
          </h2>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Travelora combines visual discovery, clear package details, and
            convenient booking into one simple travel platform.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.45 }}
              className="bg-white/30 backdrop-blur-md border border-white/40 rounded-2xl shadow-sm p-7 hover:-translate-y-1 hover:shadow-md transition-all"
            >
              <div className="text-3xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {item.title}
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500 to-sky-500 p-10 sm:p-14 text-center text-white shadow-lg"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_35%)]"></div>
          <div className="relative z-10">
            <p className="text-blue-100 font-medium mb-3">Ready to travel?</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Start Your Travel Story with Travelora
            </h2>
            <p className="text-blue-50 max-w-2xl mx-auto leading-relaxed">
              Create an account to explore packages, compare trips, and begin
              planning your next unforgettable destination.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate("/register")}
                className="px-6 py-3 rounded-2xl bg-white text-blue-600 font-semibold hover:bg-blue-50 transition"
              >
                Create Account
              </button>

              <button
                onClick={() => navigate("/login")}
                className="px-6 py-3 rounded-2xl border border-white/40 bg-white/10 backdrop-blur-sm text-white font-medium hover:bg-white/15 transition"
              >
                Login
              </button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

export default Landing