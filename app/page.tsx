"use client";

import { ArrowRight, Gift, Share2, Smartphone, Trophy, Users, Phone, Mail, MapPin, Facebook, Instagram, Linkedin, Clock } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState, Suspense, memo } from "react";
import dynamic from 'next/dynamic';

const RankingList = dynamic(() => 
  import('@/components/RankingList').then(mod => mod.RankingList || mod), {
  loading: () => (
    <div className="min-h-[400px] flex items-center justify-center bg-black">
      <div className="animate-spin h-10 w-10 border-4 border-yellow-500 rounded-full border-t-transparent"></div>
    </div>
  ),
  ssr: false 
});

const MemoizedFooter = memo(function Footer() {
  return (
    <footer className="bg-black text-white pt-12 md:pt-20 pb-6 md:pb-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="col-span-1 lg:col-span-2"
          >
            <Image
              src="https://fortaleza-aldeota.resolvenergiasolar.com/wp-content/uploads/2024/11/Logo-resolve-1024x279.webp"
              alt="Resolve Logo"
              width={240}
              height={65}
              className="mb-4 md:mb-6"
              loading="lazy"
            />
            <p className="text-sm md:text-base text-gray-400 mb-4 md:mb-6">
              A Resolve é líder em soluções de energia solar, comprometida com a sustentabilidade e inovação. Nossa missão é tornar a energia solar acessível a todos.
            </p>
            <div className="flex space-x-3 md:space-x-4">
              <Link href="https://www.facebook.com/share/1GL7wNqCaU/" target="_blank" rel="noopener noreferrer">
                <motion.div
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary hover:text-black transition-colors"
                >
                  <Facebook className="w-4 h-4 md:w-5 md:h-5" />
                </motion.div>
              </Link>
              <Link href="https://www.instagram.com/resolveenergiasolar?igsh=a3VrNWtwYTU3M2dj" target="_blank" rel="noopener noreferrer">
                <motion.div
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary hover:text-black transition-colors"
                >
                  <Instagram className="w-4 h-4 md:w-5 md:h-5" />
                </motion.div>
              </Link>
              <Link href="https://www.linkedin.com/company/resolve-solar-energia/" target="_blank" rel="noopener noreferrer">
                <motion.div
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary hover:text-black transition-colors"
                >
                  <Linkedin className="w-4 h-4 md:w-5 md:h-5" />
                </motion.div>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-3 md:space-y-4"
          >
            <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-4">Contato</h3>
            <div className="flex items-center space-x-2 md:space-x-3 text-sm md:text-base text-gray-400">
              <Phone className="w-4 h-4 md:w-5 md:h-5" />
              <span>40048688</span>
            </div>
            <div className="flex items-center space-x-2 md:space-x-3 text-sm md:text-base text-gray-400">
              <Mail className="w-4 h-4 md:w-5 md:h-5" />
              <span>ouvidoria@resolvenergiasolar.com</span>
            </div>
            <div className="flex items-start space-x-2 md:space-x-3 text-sm md:text-base text-gray-400">
              <MapPin className="w-4 h-4 md:w-5 md:h-5 mt-0.5" />
              <span>Av. Senador Lemos, 3809
                Esquina com Alferes Costa</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-3 md:space-y-4"
          >
            <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-4">Horário de Funcionamento</h3>
            <div className="flex items-center space-x-2 md:space-x-3 text-sm md:text-base text-gray-400">
              <Clock className="w-4 h-4 md:w-5 md:h-5" />
              <div>
                <p>Segunda a Sexta</p>
                <p>08:00 - 18:00</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-3 text-sm md:text-base text-gray-400">
              <Clock className="w-4 h-4 md:w-5 md:h-5" />
              <div>
                <p>Sábado</p>
                <p>09:00 - 13:00</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-white/10 text-center text-xs md:text-sm text-gray-400">
          <p>&copy; 2025 Resolve Energia Solar. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
});

interface StepCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  index: number;
}

const StepCard = memo(function StepCard({ icon: Icon, title, description, index }: StepCardProps) {
  return (
    <motion.div
      variants={{
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { delay: index * 0.1 } }
      }}
      whileHover={{ scale: 1.03, y: -5 }}
      className="text-center p-5 md:p-8 rounded-xl bg-black text-white hover:bg-black/90 transition-all"
    >
      <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary text-black mb-4 md:mb-6">
        <Icon className="h-6 w-6 md:h-8 md:w-8" />
      </div>
      <h3 className="text-xl md:text-2xl font-semibold mb-2">{title}</h3>
      <p className="text-sm md:text-lg text-gray-300">
        {description}
      </p>
    </motion.div>
  );
});

export default function Home() {
  const [isRankingVisible, setIsRankingVisible] = useState(false);
  const [isIPhoneImageLoaded, setIsIPhoneImageLoaded] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          navigator.serviceWorker.register('/sw.js')
            .then(registration => {
              console.log('Service Worker registrado com sucesso:', registration.scope);
            })
            .catch(err => {
              console.log('Falha no registro do Service Worker:', err);
            });
        }, 1000); 
      });
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsRankingVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    
    const rankingPlaceholder = document.getElementById('ranking-placeholder');
    if (rankingPlaceholder) {
      observer.observe(rankingPlaceholder);
    }
    
    return () => {
      observer.disconnect();
    };
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const steps = [
    {
      icon: Users,
      title: "Indique amigos",
      description: "Compartilhe seu link de indicação com amigos e familiares para começar."
    },
    {
      icon: Share2,
      title: "Seus amigos contratam",
      description: "Indique seus amigos e aumente suas chances de ganhar um iPhone 15 a cada venda convertida!"
    },
    {
      icon: Trophy,
      title: "Ganhe um iPhone 15",
      description: "O participante com mais indicações convertidas em vendas até 31/03/2025 ganha um iPhone 15"
    }
  ];

  return (
    <div className="min-h-screen">
      <div className="relative bg-black overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.1),transparent_70%)]" />
        <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-8 md:mb-12"
          >
            <Image
              src="https://fortaleza-aldeota.resolvenergiasolar.com/wp-content/uploads/2024/11/Logo-resolve-1024x279.webp"
              alt="Resolve Logo"
              width={400}
              height={109}
              priority
              className="h-14 md:h-20 w-auto"
            />
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              variants={staggerChildren}
              initial="initial"
              animate="animate"
              className="text-center md:text-left text-white"
            >
              <motion.h1
                variants={fadeInUp}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 md:mb-6"
              >
                Indique amigos, transforme indicações em vendas<br />
                <span className="text-primary">
                  e ganhe um iPhone 15!
                </span>
              </motion.h1>
              <motion.p
                variants={fadeInUp}
                className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 md:mb-8"
              >
                As indicações que resultarem em vendas confirmadas contam para o ranking.
                Quem converter mais indicações em vendas válidas até 31/03/2025 leva um iPhone 15 para casa!
              </motion.p>
              <motion.div variants={fadeInUp}>
                <Link href="/onboarding">
                  <Button size="lg" className="w-full md:w-auto animate-pulse bg-primary text-black hover:bg-primary/90">
                    Quero meu iPhone! Indicar agora
                    <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateY: 15 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative mx-auto max-w-xs md:max-w-lg mt-6 md:mt-0"
            >
              <div className="relative">
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(255,215,0,0.3)",
                      "0 0 60px rgba(255,215,0,0.2)",
                      "0 0 20px rgba(255,215,0,0.3)"
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="rounded-3xl overflow-hidden"
                >
                  <Image
                    src="https://mir-s3-cdn-cf.behance.net/project_modules/max_3840_webp/34b5bf180145769.6505ae7623131.jpg"
                    alt="iPhone 15"
                    width={800}
                    height={1000}
                    className={`rounded-3xl transform hover:scale-105 transition-transform duration-500 ${isIPhoneImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    priority
                    onLoad={() => setIsIPhoneImageLoaded(true)}
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 bg-primary text-black px-4 py-2 md:px-6 md:py-3 rounded-full shadow-xl text-sm md:text-lg"
                >
                  <p className="font-bold">iPhone 15 Pro</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div id="ranking-placeholder" className="min-h-[100px]">
        {isRankingVisible && <RankingList />}
      </div>

      <div className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10 md:mb-16"
          >
            <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4 text-black">Como Funciona</h2>
            <p className="text-base md:text-xl text-gray-600">
              Três passos simples para concorrer ao iPhone 15
            </p>
          </motion.div>

          <motion.div
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
          >
            {steps.map((step, index) => (
              <StepCard 
                key={index}
                icon={step.icon} 
                title={step.title} 
                description={step.description} 
                index={index}
              />
            ))}
          </motion.div>
        </div>
      </div>

      <div className="py-16 md:py-24 bg-primary">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid md:grid-cols-2 gap-8 md:gap-12 items-center"
          >
            <motion.div
              variants={staggerChildren}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <motion.h2 variants={fadeInUp} className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 text-black">O Prêmio</motion.h2>
              <motion.div variants={fadeInUp} className="space-y-3 md:space-y-4 text-base md:text-lg text-black mb-6 md:mb-8">
                <p>
                  Consulte o Regulamento para obter informações detalhadas
                  sobre a premiação
                </p>
                <ul className="space-y-2">
                  {[
                    "Tela Super Retina XDR OLED de 6.1",
                    "Câmera dupla de 48MP",
                    "Chip A16 Bionic",
                    "5G ultrarrápido"
                  ].map((feature, index) => (
                    <motion.li 
                      key={index}
                      variants={fadeInUp} 
                      className="flex items-center"
                    >
                      <Gift className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                      {feature}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
              <motion.div variants={fadeInUp} className="flex justify-center md:justify-start">
                <Link href="/onboarding">
                  <Button size="lg" className="w-full md:w-auto bg-black text-white hover:bg-black/90">
                    Entre no ranking! Indique agora
                    <Smartphone className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="relative mt-8 md:mt-0"
            >
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotateZ: [0, 2, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Image
                  src="https://mir-s3-cdn-cf.behance.net/project_modules/max_3840_webp/34b5bf180145769.6505ae7623131.jpg"
                  alt="iPhone 15 Pro"
                  width={800}
                  height={1000}
                  className="rounded-3xl shadow-2xl"
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                />
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 bg-black text-white p-3 md:p-4 rounded-lg shadow-lg text-sm md:text-base"
              >
                <p className="font-bold">Top 2 Ganham!</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="py-16 md:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 md:mb-16"
          >
            <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">Dúvidas Frequentes</h2>
            <p className="text-base md:text-xl text-gray-600">
              Encontre respostas para as perguntas mais comuns
            </p>
          </motion.div>

          <Suspense fallback={<div className="h-64 w-full flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div></div>}>
            <motion.div
              variants={staggerChildren}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <Accordion type="single" collapsible className="w-full space-y-3 md:space-y-4">
                {[
                  {
                    id: "item-1",
                    question: "Como funciona o sistema de indicações?",
                    answer: "Após o cadastro, você receberá um link exclusivo. Compartilhe-o com amigos e familiares. Cada preenchimento realizado através do seu link será registrado como uma indicação. No entanto, o ranking para concorrer ao iPhone 15 será contabilizado apenas para indicações convertidas em venda."
                  },
                  {
                    id: "item-2",
                    question: "Quem pode participar da promoção?",
                    answer: "Qualquer pessoa maior de 18 anos, residente no Brasil, pode participar da promoção. Não é necessário ser cliente da Resolve para participar."
                  },
                  {
                    id: "item-3",
                    question: "Até quando posso participar?",
                    answer: "A promoção está válida até 31/03/2025."
                  },
                  {
                    id: "item-4",
                    question: "Como sei se estou ganhando?",
                    answer: "Você pode acompanhar sua posição no ranking em tempo real através do painel de indicações. Os 2 primeiros colocados ganharão um iPhone 15."
                  },
                  {
                    id: "item-5",
                    question: "Como receberei o prêmio?",
                    answer: "Os vencedores serão contactados por email e telefone para combinar a entrega do iPhone 15. O prêmio será entregue em mãos na loja mais próxima da Resolve."
                  }
                ].map(item => (
                  <AccordionItem key={item.id} value={item.id} className="border rounded-lg px-4 md:px-6">
                    <AccordionTrigger className="text-base md:text-lg font-semibold">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm md:text-base text-gray-600">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </Suspense>
        </div>
      </div>

      <div className="bg-black text-white py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">
            Não perca essa oportunidade!
          </h2>
          <p className="text-base md:text-xl mb-6 md:mb-8 text-gray-300">
            Quanto mais rápido você começar, maiores suas chances de ganhar.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4"
          >
            <Link href="/onboarding">
              <Button
                size="lg"
                className="w-full md:w-auto animate-pulse bg-primary text-black hover:bg-primary/90"
              >
                Compartilhe e ganhe! Clique aqui
                <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <MemoizedFooter />
    </div>
  );
}
