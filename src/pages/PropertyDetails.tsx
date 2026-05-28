import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Bed, Bath, Square, MapPin, Share2, MessageCircle, FileDown, Heart } from "lucide-react";
import type { Property } from "../types";
import { formatCurrency, formatPropertyId } from "../utils";
import MortgageCalculator from "../components/MortgageCalculator";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { motion } from "motion/react";
import ImageGallery from "../components/ImageGallery";
import { useFavorites } from "../hooks/useFavorites";

export default function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);
  const { isFavorite, toggleFavorite } = useFavorites();

  const isFav = property ? isFavorite(property.id) : false;

  useEffect(() => {
    fetch(`/api/properties/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(data => {
        setProperty(data);
        setLoading(false);
      })
      .catch(() => {
        setProperty(null);
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, propertyId: Number(id) })
    })
    .then(res => {
      if (!res.ok) throw new Error("Erro ao salvar mensagem.");
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    })
    .catch(err => {
      console.error(err);
      alert("Não foi possível enviar a mensagem no momento. Tente novamente mais tarde.");
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  const handleDownloadPDF = async () => {
    if (!pdfRef.current || !property) return;
    setIsGeneratingPDF(true);
    try {
      const canvas = await html2canvas(pdfRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`ficha-tecnica-${property.id}.pdf`);
    } catch (e) {
      console.error('Error generating PDF', e);
      alert('Não foi possível gerar o PDF. Tente novamente mais tarde.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (loading) return <div className="py-32 text-center animate-pulse">Carregando...</div>;
  if (!property) return <div className="py-32 text-center text-xl text-gray-500">Imóvel não encontrado.</div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      
      <ImageGallery 
        mainImage={property.image || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80'} 
        galleryImagesRaw={property.galleryImages}
        virtualTourUrl={property.virtualTourUrl}
      />

      <div className="container mx-auto px-4 -mt-16 md:-mt-20 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Info */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:w-2/3 space-y-8"
          >
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded uppercase tracking-wider">
                      {property.status === 'venda' ? 'Venda' : 'Locação'}
                    </span>
                    <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded capitalize tracking-wider">
                      {property.type}
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  <div className="flex items-center gap-1 text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>{property.city}, {property.state}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    {formatCurrency(property.price)}
                  </div>
                  {property.status === 'locacao' && <span className="text-gray-500">/ mês</span>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-100 my-6">
                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl">
                  <Bed className="w-6 h-6 text-gray-400 mb-2" />
                  <span className="font-semibold text-gray-900">{property.bedrooms}</span>
                  <span className="text-sm text-gray-500">Quartos</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl">
                  <Bath className="w-6 h-6 text-gray-400 mb-2" />
                  <span className="font-semibold text-gray-900">{property.bathrooms}</span>
                  <span className="text-sm text-gray-500">Banheiros</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl">
                  <Square className="w-6 h-6 text-gray-400 mb-2" />
                  <span className="font-semibold text-gray-900">{property.area} m²</span>
                  <span className="text-sm text-gray-500">Área Útil</span>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Descrição do Imóvel</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {property.description}
                </p>
              </div>
            </div>

            {/* Map Embed (Placeholder using iframe to maps) */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Localização</h3>
              <div className="w-full h-[300px] rounded-xl overflow-hidden bg-gray-100">
                <iframe 
                  title="Mapa"
                  width="100%" 
                  height="100%" 
                  style={{border:0}} 
                  loading="lazy" 
                  allowFullScreen 
                  referrerPolicy="no-referrer-when-downgrade" 
                  src={`https://www.google.com/maps/embed/v1/place?key=MOCK_KEY&q=${encodeURIComponent(property.city + ', ' + property.state)}`}
                ></iframe>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">Exibição de mapa ilustrativa baseada na cidade.</p>
            </div>

            {/* Mortgage Calculator */}
            {property.status === 'venda' && (
              <MortgageCalculator propertyValue={property.price} />
            )}
          </motion.div>

          {/* Sidebar / Lead Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:w-1/3"
          >
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Tenho Interesse</h3>
              
              {submitted ? (
                <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 text-center">
                  <p className="font-medium">Mensagem enviada com sucesso!</p>
                  <p className="mt-2 text-sm">Um corretor entrará em contato em breve.</p>
                  <button onClick={() => setSubmitted(false)} className="mt-4 text-green-700 underline text-sm">Enviar outra mensagem</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp</label>
                    <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                    <textarea required rows={4} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full border-gray-300 rounded-lg p-2.5 border outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="Olá, gostaria de mais informações..."></textarea>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition">
                    Enviar Mensagem
                  </button>
                </form>
              )}

              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                <button onClick={() => toggleFavorite(property.id)} className={`w-full flex items-center justify-center gap-2 font-medium py-3 rounded-lg transition border ${isFav ? 'bg-red-50 text-red-500 border-red-100 hover:bg-red-100' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>
                  <Heart className={`w-5 h-5 ${isFav ? 'fill-red-500' : ''}`} />
                  {isFav ? 'Salvo nos Favoritos' : 'Salvar Imóvel'}
                </button>
                <a href={`https://wa.me/5565999999999?text=${encodeURIComponent(`Olá, tenho interesse no imóvel ${property.title} - Ref: ${formatPropertyId(property.id)}`)}`} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-700 font-medium py-3 rounded-lg hover:bg-green-100 transition border border-transparent">
                  <MessageCircle className="w-5 h-5" />
                  Chamar no WhatsApp
                </a>
                <button onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-700 font-medium py-3 rounded-lg hover:bg-blue-100 transition border border-transparent disabled:opacity-50 disabled:cursor-not-allowed">
                  <FileDown className="w-5 h-5" />
                  {isGeneratingPDF ? 'Gerando PDF...' : 'Baixar Ficha (PDF)'}
                </button>
                <button onClick={handleShare} className="w-full flex items-center justify-center gap-2 bg-gray-50 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-100 transition border border-transparent">
                  <Share2 className="w-5 h-5" />
                  Compartilhar Imóvel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Hidden PDF Template */}
      <div className="absolute left-[-9999px] top-0">
        <div ref={pdfRef} className="pdf-container bg-white w-[800px] p-10 font-sans text-gray-900">
          <div className="border-b-2 border-blue-600 pb-4 mb-6 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">{property.title}</h1>
              <div className="flex items-center gap-1 text-gray-500">
                <MapPin className="w-4 h-4" />
                <span>{property.city}, {property.state}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded uppercase tracking-wider block mb-2 w-max ml-auto">
                {property.status === 'venda' ? 'Venda' : 'Locação'}
              </span>
              <div className="text-sm text-gray-500">Ref: {formatPropertyId(property.id)}</div>
            </div>
          </div>
          
          <img 
            src={property.image} 
            crossOrigin="anonymous"
            alt={property.title}
            className="w-full h-[400px] object-cover rounded-xl mb-8"
          />

          <div className="grid grid-cols-3 gap-6 mb-8 mt-4 border-y py-6 border-gray-100">
            <div className="flex items-center gap-3">
              <Bed className="w-8 h-8 text-blue-600" />
              <div>
                <div className="font-bold text-2xl">{property.bedrooms}</div>
                <div className="text-sm text-gray-500 uppercase font-semibold">Quartos</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Bath className="w-8 h-8 text-blue-600" />
              <div>
                <div className="font-bold text-2xl">{property.bathrooms}</div>
                <div className="text-sm text-gray-500 uppercase font-semibold">Banheiros</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Square className="w-8 h-8 text-blue-600" />
              <div>
                <div className="font-bold text-2xl">{property.area} m²</div>
                <div className="text-sm text-gray-500 uppercase font-semibold">Área Útil</div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Descrição</h3>
            <p className="text-gray-600 text-justify leading-relaxed whitespace-pre-wrap">
              {property.description}
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 flex justify-between items-center">
            <div>
              <div className="text-gray-500 text-sm uppercase font-semibold mb-1">Valor do Imóvel</div>
              <div className="text-4xl font-bold text-blue-600">
                {formatCurrency(property.price)}
                {property.status === 'locacao' && <span className="text-xl text-gray-500 font-medium"> / mês</span>}
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-900">Blessed Imobiliária</div>
              <div className="text-sm text-gray-600">Tangará da Serra - MT</div>
              <div className="text-sm text-gray-600">(65) 99999-9999</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
