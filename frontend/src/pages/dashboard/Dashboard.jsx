import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, Cpu, Radio, Zap, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

const Dashboard = () => {
    const navigate = useNavigate();

    const products = [
        { 
            id: 1, 
            name: "Smart Gateway Hub v3", 
            description: "Barcha qurilmalarni birlashtiruvchi aqlli markaz", 
            price: 1249000, 
            category: "IoT Markaz",
            icon: Cpu 
        },
        { 
            id: 2, 
            name: "Industrial Sensor Pro", 
            description: "Yuqori aniqlikdagi sanoat datchiklari", 
            price: 895000, 
            category: "Sensorlar",
            icon: Radio 
        },
        { 
            id: 3, 
            name: "Energy Master 5000", 
            description: "Elektr energiyasini tejaydigan aqlli tizim", 
            price: 675000, 
            category: "Energiya",
            icon: Zap 
        }
    ];

    const handleBuy = (product) => {
        const { icon, ...productData } = product;
        navigate('/checkout', { 
            state: { 
                product: productData,
                price: product.price 
            } 
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-slate-900 p-6 font-sans">
            {/* Background Glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[120px]" />
                <div className="absolute -bottom-40 -left-40 w-[700px] h-[700px] bg-indigo-400/10 rounded-full blur-[140px]" />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <header className="flex justify-between items-center mb-12 bg-white/80 backdrop-blur-xl border border-white shadow-xl rounded-3xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl shadow-lg">
                            <Cpu size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter text-slate-900">IOT <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Market</span></h1>
                            <p className="text-slate-500 text-sm">Aqlli uy va sanoat yechimlari</p>
                        </div>
                    </div>

                    <Button 
                        variant="secondary" 
                        className="!w-auto !py-3 !px-6 !text-sm bg-white border border-slate-200 hover:bg-slate-50"
                        onClick={() => { localStorage.clear(); navigate('/login'); }}
                    >
                        <LogOut size={18} className="mr-2" /> Chiqish
                    </Button>
                </header>

                <div className="mb-10">
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">Mahsulotlar</h2>
                    <p className="text-slate-600">Eng yangi va ishonchli IoT qurilmalari</p>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map((product, index) => (
                        <motion.div 
                            key={product.id}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -12, transition: { duration: 0.3 } }}
                            className="group bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500"
                        >
                            {/* Icon Area */}
                            <div className="h-56 bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-[radial-gradient(at_center,#ffffff15_0%,transparent_70%)]" />
                                <product.icon 
                                    size={92} 
                                    className="text-white/90 group-hover:scale-110 transition-transform duration-500" 
                                />
                                <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20">
                                    {product.category}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8">
                                <h3 className="text-2xl font-semibold mb-3 text-slate-900 leading-tight">
                                    {product.name}
                                </h3>
                                <p className="text-slate-600 mb-8 line-clamp-3 min-h-[72px]">
                                    {product.description}
                                </p>

                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className="text-xs text-slate-500 font-medium tracking-widest">NARXI</span>
                                        <div className="text-3xl font-bold text-slate-900 mt-1">
                                            {product.price.toLocaleString('uz-UZ')} <span className="text-base font-normal text-slate-500">so‘m</span>
                                        </div>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => handleBuy(product)}
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-4 rounded-2xl flex items-center gap-3 shadow-lg shadow-blue-500/30 transition-all"
                                    >
                                        <ShoppingCart size={20} />
                                        Sotib olish
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;