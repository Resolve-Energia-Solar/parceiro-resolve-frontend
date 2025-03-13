"use client";

import { ArrowRight, Gift, Share2, Smartphone, Trophy, Users, Medal, Phone, Mail, MapPin, Facebook, Instagram, Linkedin, Clock } from "lucide-react";
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
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js').then(
          function (registration) {
            console.log('Service Worker registrado com sucesso:', registration.scope);
          },
          function (err) {
            console.log('Falha no registro do Service Worker:', err);
          }
        );
      });
    }
  }, []);

  useEffect(() => {
    setMounted(true);
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

  interface Participant {
    name: string;
    referrals: number;
    position: number;
  }

  const [topParticipants, setTopParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopParticipants() {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('name, approved_referrals')
          .order('referral_count', { ascending: false })
          .limit(5);

        if (error) throw error;

        const formattedData = data.map((user, index) => ({
          name: user.name,
          referrals: user.approved_referrals,
          position: index + 1
        }));

        setTopParticipants(formattedData);
      } catch (error) {
        console.error("Error fetching top participants:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTopParticipants();
  }, []);

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy className="w-6 h-6 md:w-8 md:h-8 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />;
      case 3: return <Medal className="w-6 h-6 md:w-8 md:h-8 text-amber-600" />;
      default: return <Users className="w-6 h-6 md:w-8 md:h-8 text-primary" />;
    }
  };

  if (!mounted) {
    return null;
  }

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
                Indique amigos<br />
                <span className="text-primary">
                  e concorra a um iPhone 15!
                </span>
              </motion.h1>
              <motion.p
                variants={fadeInUp}
                className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 md:mb-8"
              >
                Vendas convertidas contabilizam para o ranking. Quem tiver mais vendas até 31/03/2025 concorre a um iPhone! </motion.p>
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
                    className="rounded-3xl transform hover:scale-105 transition-transform duration-500"
                    priority
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

      <div className="py-12 sm:py-16 md:py-24 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 md:mb-4 text-white">Top 4 Ganhadores</h2>
            <p className="text-base md:text-xl text-gray-400">
              Os participantes mais próximos de ganhar um iPhone 15
            </p>
          </motion.div>

          <div className="mb-10 md:mb-20">
            <div className="hidden md:flex relative h-[300px] md:h-[400px] items-end justify-center gap-2 md:gap-4">
              {topParticipants.slice(0, 3).map((participant, index) => (
                <motion.div
                  key={participant.position}
                  initial={{ height: 0, opacity: 0 }}
                  whileInView={{
                    height: index === 1 ? "300px" : index === 0 ? "250px" : "200px",
                    opacity: 1
                  }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.5, ease: "backOut" }}
                  className="w-full max-w-[180px] md:max-w-[240px] relative"
                >
                  <div className={`absolute inset-0 bg-gradient-to-t ${index === 0 ? "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30" :
                    index === 1 ? "from-gray-500/20 to-gray-600/20 border-gray-500/30" :
                      "from-amber-500/20 to-amber-600/20 border-amber-500/30"
                    } border rounded-t-lg backdrop-blur-sm`}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + index * 0.2 }}
                      className="absolute -top-12 md:-top-16 left-1/2 -translate-x-1/2"
                    >
                      <div className="relative">
                        {index === 0 && (
                          <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm border border-yellow-400/50">
                            {getPositionIcon(participant.position)}
                          </div>
                        )}

                        {index > 0 && (
                          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm border border-gray-400/50">
                            {getPositionIcon(participant.position)}
                          </div>
                        )}

                        <motion.div
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.7 + index * 0.2 }}
                          className={`absolute -top-2 -right-2 ${index === 0 ? "bg-yellow-500" :
                            index === 1 ? "bg-gray-400" :
                              "bg-amber-600"
                            } text-black w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-base font-bold`}
                        >
                          {participant.position}
                        </motion.div>
                      </div>
                      <div className="mt-2 text-center">
                        <h3 className={`text-white font-bold text-sm md:text-base ${index === 0 ? 'md:text-xl' : ''}`}>
                          {participant.name.length > 12
                            ? `${participant.name.substring(0, 12)}...`
                            : participant.name}
                        </h3>
                        <p className={`text-xs md:text-sm ${index === 0 ? "text-yellow-400 font-semibold" :
                          index === 1 ? "text-gray-400" :
                            "text-amber-400"
                          }`}>{participant.referrals} vendas convertidas</p>
                      </div>
                    </motion.div>
                  </div>
                  <div className={`absolute bottom-0 w-full text-center py-1 md:py-2 text-xs md:text-sm ${index === 0 ? "bg-yellow-500/20 border-yellow-400/30" :
                    index === 1 ? "bg-gray-500/20 border-gray-400/30" :
                      "bg-amber-500/20 border-amber-400/30"
                    } backdrop-blur-sm rounded-t-lg border-t`}>
                    {participant.position}º Lugar
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="md:hidden space-y-3">
              {topParticipants.slice(0, 3).map((participant, index) => (
                <motion.div
                  key={participant.position}
                  variants={{
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0 }
                  }}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                  className={`relative overflow-hidden rounded-xl p-3 ${index === 0
                    ? "bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20"
                    : index === 1
                      ? "bg-gradient-to-r from-gray-500/10 to-gray-500/5 border border-gray-500/20"
                      : "bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${index === 0 ? "bg-yellow-500/20 border border-yellow-400" :
                        index === 1 ? "bg-gray-500/20 border border-gray-400" :
                          "bg-amber-500/20 border border-amber-400"
                        }`}>
                        {getPositionIcon(participant.position)}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">
                          {participant.name.length > 15
                            ? `${participant.name.substring(0, 15)}...`
                            : participant.name}
                        </h3>
                        <p className="text-xs text-gray-400">{participant.referrals} vendas convertidas</p>
                      </div>
                    </div>
                    <div className={`text-xl font-bold ${index === 0 ? "text-yellow-400" :
                      index === 1 ? "text-gray-400" :
                        "text-amber-400"
                      }`}>
                      #{participant.position}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <h1 className="text-center my-4 md:my-10 text-white text-xs md:text-sm font-semi-bold">Imagem meramente ilustrativa</h1>
          </div>

          <motion.div
            variants={{
              initial: { opacity: 0 },
              animate: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid gap-4"
          >
            {topParticipants.slice(3, 4).map((participant, index) => (
              <motion.div
                key={participant.position}
                variants={{
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.01, x: 5 }}
                className="relative overflow-hidden rounded-xl p-3 md:p-6 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20"
              >
                <motion.div
                  initial={false}
                  animate={{
                    width: topParticipants[0]?.referrals
                      ? `${(participant.referrals / topParticipants[0].referrals) * 100}%`
                      : "0%"
                  }}
                  className="absolute inset-0 bg-white/5"
                  style={{ originX: 0 }}
                  transition={{ duration: 1 }}
                />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2 md:gap-6">
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                      className="flex items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-full bg-black/50 backdrop-blur-sm"
                    >
                      {getPositionIcon(participant.position)}
                    </motion.div>
                    <div>
                      <h3 className="text-base md:text-2xl font-bold text-white">
                        {participant.name.length > 15 && window.innerWidth < 768
                          ? `${participant.name.substring(0, 15)}...`
                          : participant.name}
                      </h3>
                      <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-400">
                        <Users className="w-3 h-3 md:w-4 md:h-4" />
                        <span>{participant.referrals} indicações</span>
                      </div>
                    </div>
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-right"
                  >
                    <div className="text-lg md:text-3xl font-bold text-primary">#{participant.position}</div>
                    <div className="text-xs md:text-sm text-gray-400">posição</div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
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
            <motion.div
              variants={fadeInUp}
              whileHover={{ scale: 1.03, y: -5 }}
              className="text-center p-5 md:p-8 rounded-xl bg-black text-white hover:bg-black/90 transition-all"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary text-black mb-4 md:mb-6">
                <Users className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-2">Indique amigos</h3>
              <p className="text-sm md:text-lg text-gray-300">
                Compartilhe seu link de indicação com amigos e familiares para começar.
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              whileHover={{ scale: 1.03, y: -5 }}
              className="text-center p-5 md:p-8 rounded-xl bg-black text-white hover:bg-black/90 transition-all"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary text-black mb-4 md:mb-6">
                <Share2 className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-2">Seus amigos contratam</h3>
              <p className="text-sm md:text-lg text-gray-300">
                Indique seus amigos e aumente suas chances de ganhar um iPhone 15 a cada venda convertida!
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              whileHover={{ scale: 1.03, y: -5 }}
              className="text-center p-5 md:p-8 rounded-xl bg-black text-white hover:bg-black/90 transition-all"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary text-black mb-4 md:mb-6">
                <Trophy className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-2">Ganhe um iPhone 15</h3>
              <p className="text-sm md:text-lg text-gray-300">
                O participante com mais indicações convertidas em vendas até 31/03/2025 ganha um iPhone 15
              </p>
            </motion.div>
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
                  <motion.li variants={fadeInUp} className="flex items-center">
                    <Gift className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                    Tela Super Retina XDR OLED de 6.1"
                  </motion.li>
                  <motion.li variants={fadeInUp} className="flex items-center">
                    <Gift className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                    Câmera dupla de 48MP
                  </motion.li>
                  <motion.li variants={fadeInUp} className="flex items-center">
                    <Gift className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                    Chip A16 Bionic
                  </motion.li>
                  <motion.li variants={fadeInUp} className="flex items-center">
                    <Gift className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                    5G ultrarrápido
                  </motion.li>
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
              viewport={{ once: true }}
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

          <motion.div
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <Accordion type="single" collapsible className="w-full space-y-3 md:space-y-4">
              <AccordionItem value="item-1" className="border rounded-lg px-4 md:px-6">
                <AccordionTrigger className="text-base md:text-lg font-semibold">
                  Como funciona o sistema de indicações?
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-base text-gray-600">
                  Após o cadastro, você receberá um link
                  exclusivo. Compartilhe-o com amigos e familiares. Cada preenchimento realizado através do
                  seu link será registrado como uma indicação. No entanto, os pontos do ranking para concorrer
                  ao iPhone 15 serão contabilizados apenas para indicações convertidas em venda. </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border rounded-lg px-4 md:px-6">
                <AccordionTrigger className="text-base md:text-lg font-semibold">
                  Quem pode participar da promoção?
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-base text-gray-600">
                  Qualquer pessoa maior de 18 anos, residente no Brasil, pode participar da promoção. Não é necessário ser cliente da Resolve para participar.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border rounded-lg px-4 md:px-6">
                <AccordionTrigger className="text-base md:text-lg font-semibold">
                  Até quando posso participar?
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-base text-gray-600">
                  A promoção está válida até 31/03/2025. </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border rounded-lg px-4 md:px-6">
                <AccordionTrigger className="text-base md:text-lg font-semibold">
                  Como sei se estou ganhando?
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-base text-gray-600">
                  Você pode acompanhar sua posição no ranking em tempo real
                  através do painel de indicações. Os 2 primeiros colocados ganharão um iPhone 15. </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border rounded-lg px-4 md:px-6">
                <AccordionTrigger className="text-base md:text-lg font-semibold">
                  Como receberei o prêmio?
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-base text-gray-600">
                  Os vencedores serão contactados por email e telefone para combinar a entrega do iPhone 15. O prêmio será entregue em mãos na loja mais próxima da Resolve.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>
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
              />
              <p className="text-sm md:text-base text-gray-400 mb-4 md:mb-6">
                A Resolve é líder em soluções de energia solar, comprometida com a sustentabilidade e inovação. Nossa missão é tornar a energia solar acessível a todos.
              </p>
              <div className="flex space-x-3 md:space-x-4">
                <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                  <motion.div
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary hover:text-black transition-colors"
                  >
                    <Facebook className="w-4 h-4 md:w-5 md:h-5" />
                  </motion.div>
                </Link>
                <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  <motion.div
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary hover:text-black transition-colors"
                  >
                    <Instagram className="w-4 h-4 md:w-5 md:h-5" />
                  </motion.div>
                </Link>
                <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
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
    </div>
  );
}
