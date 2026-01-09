import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-200 mt-auto">
      <div className="container px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Tiles Palace" className="w-8 h-8 object-contain rounded-md" />
              <h3 className="text-xl font-display font-bold text-white">Tiles Palace</h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Premium tiles, kitchen fittings, and lighting solutions for the modern home. Elevate your space with our curated collection.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Products</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/catalog?category=tiles" className="hover:text-white transition-colors">Tiles</Link></li>
              <li><Link href="/catalog?category=lighting" className="hover:text-white transition-colors">Lighting</Link></li>
              <li><Link href="/catalog?category=kitchen" className="hover:text-white transition-colors">Kitchen Fittings</Link></li>
              <li><Link href="/catalog?category=shower" className="hover:text-white transition-colors">Showers & Bath</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>123 Design Avenue</li>
              <li>Interior City, IC 90210</li>
              <li>contact@tilespalace.com</li>
              <li>+1 (555) 123-4567</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Tiles Palace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
