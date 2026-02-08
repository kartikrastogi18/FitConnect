import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { trainerAPI, traineeAPI } from "../../api";
import {
    Search,
    Star,
    Award,
    Users,
    ArrowLeft,
    ChevronRight,
    Filter
} from "lucide-react";
import toast from "react-hot-toast";

export const TrainerSearch = () => {
    const navigate = useNavigate();
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [specialty, setSpecialty] = useState("");

    useEffect(() => {
        loadTrainers();
    }, []);

    const loadTrainers = async () => {
        try {
            const params = {};
            if (specialty) params.specialty = specialty;

            // Use the public trainers endpoint which returns approved trainers
            const response = await trainerAPI.getAllTrainers(params);
            setTrainers(response.data.trainers || []);
        } catch (error) {
            console.error("Error loading trainers:", error);
            toast.error("Failed to load trainers");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setLoading(true);
        loadTrainers();
    };

    // Filter trainers client-side by search query
    const filteredTrainers = trainers.filter(trainer => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        const username = trainer.username?.toLowerCase() || "";
        const profile = trainer.trainerProfile;
        const bio = profile?.bio?.toLowerCase() || "";
        const specialties = profile?.specialties?.toLowerCase() || "";
        const certifications = profile?.certifications?.toLowerCase() || "";

        return username.includes(query) ||
            bio.includes(query) ||
            specialties.includes(query) ||
            certifications.includes(query);
    });

    return (
        <div className="min-h-screen bg-dark-900 bg-mesh-pattern">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-electric-blue/5 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-neon-green/5 rounded-full blur-3xl animate-pulse-slow" />
            </div>

            {/* Header */}
            <header className="relative z-10 border-b border-dark-600 bg-dark-900/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/trainee/dashboard")}
                            className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-400" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Find Your <span className="text-gradient">Trainer</span></h1>
                            <p className="text-gray-500 text-sm">Browse certified fitness experts</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="mb-8">
                    <div className="card-dark flex flex-col md:flex-row gap-4 p-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, specialty, or certification..."
                                className="input-dark pl-12 w-full"
                            />
                        </div>
                        <div className="flex gap-3">
                            <select
                                value={specialty}
                                onChange={(e) => setSpecialty(e.target.value)}
                                className="input-dark min-w-[160px]"
                            >
                                <option value="">All Specialties</option>
                                <option value="weight_training">Weight Training</option>
                                <option value="cardio">Cardio & HIIT</option>
                                <option value="yoga">Yoga</option>
                                <option value="nutrition">Nutrition</option>
                                <option value="bodybuilding">Bodybuilding</option>
                            </select>
                            <button type="submit" className="btn-neon flex items-center gap-2">
                                <Search className="w-5 h-5" />
                                Search
                            </button>
                        </div>
                    </div>
                </form>

                {/* Results Count */}
                <div className="flex items-center justify-between mb-6">
                    <p className="text-gray-400">
                        Found <span className="text-white font-semibold">{filteredTrainers.length}</span> trainers
                    </p>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Filter className="w-4 h-4" />
                        <span>Sorted by trust score</span>
                    </div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-neon-green border-t-transparent rounded-full animate-spin" />
                            <p className="text-gray-400">Finding trainers...</p>
                        </div>
                    </div>
                ) : filteredTrainers.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-dark-700 flex items-center justify-center">
                            <Users className="w-12 h-12 text-gray-600" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No Trainers Found</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            {trainers.length === 0
                                ? "No approved trainers are available yet. Please check back later."
                                : "Try adjusting your search criteria."}
                        </p>
                        <button onClick={() => { setSearchQuery(""); setSpecialty(""); loadTrainers(); }} className="btn-dark">
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTrainers.map((trainer) => {
                            const profile = trainer.trainerProfile;
                            return (
                                <div
                                    key={trainer.id}
                                    onClick={() => navigate(`/trainers/${trainer.id}`)}
                                    className="group card-glow cursor-pointer hover:scale-[1.02] transition-all duration-300"
                                >
                                    {/* Header with Avatar */}
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-electric-blue to-neon-cyan flex items-center justify-center flex-shrink-0">
                                            <span className="text-2xl font-bold text-dark-900">
                                                {trainer.username?.[0]?.toUpperCase() || "T"}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-bold text-white truncate group-hover:text-neon-green transition-colors">
                                                {trainer.username || "Trainer"}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                    <span className="text-white font-semibold">
                                                        {profile?.trustScore?.toFixed(1) || "5.0"}
                                                    </span>
                                                </div>
                                                <span className="text-gray-600">•</span>
                                                <span className="text-gray-400 text-sm">
                                                    {profile?.experienceYears || 0} yrs exp
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bio */}
                                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                        {profile?.bio || "Certified fitness trainer ready to help you reach your goals."}
                                    </p>

                                    {/* Specialties */}
                                    {profile?.specialties && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {profile.specialties.split(",").slice(0, 3).map((specialty, idx) => (
                                                <span key={idx} className="px-2 py-1 rounded-lg text-xs font-medium bg-dark-600 text-gray-300 border border-dark-500">
                                                    {specialty.trim()}
                                                </span>
                                            ))}
                                            {profile.specialties.split(",").length > 3 && (
                                                <span className="px-2 py-1 rounded-lg text-xs font-medium bg-dark-600 text-gray-400">
                                                    +{profile.specialties.split(",").length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Certifications */}
                                    {profile?.certifications && (
                                        <div className="flex items-center gap-2 mb-4">
                                            <Award className="w-4 h-4 text-neon-green" />
                                            <span className="text-sm text-gray-400 truncate">
                                                {profile.certifications.split(",")[0]}
                                            </span>
                                        </div>
                                    )}

                                    {/* CTA */}
                                    <div className="flex items-center justify-between pt-4 border-t border-dark-500">
                                        <div className="text-sm text-gray-400">
                                            <span className="text-white font-semibold">₹{profile?.currentPayoutPerDay || 500}</span> / session
                                        </div>
                                        <button className="btn-dark py-2 px-4 text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            View Profile <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};
