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
          .select('name, referral_count')
          .order('referral_count', { ascending: false })
          .limit(5);

        if (error) throw error;

        const formattedData = data.map((user, index) => ({
          name: user.name,
          referrals: user.referral_count,
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
      case 1: return <Trophy className="w-8 h-8 text-yellow-500" />;
      case 2: return <Medal className="w-8 h-8 text-gray-400" />;
      case 3: return <Medal className="w-8 h-8 text-amber-600" />;
      default: return <Users className="w-8 h-8 text-primary" />;
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="relative bg-black overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.1),transparent_70%)]" />
        <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-12"
          >
            <Image
              src="https://fortaleza-aldeota.resolvenergiasolar.com/wp-content/uploads/2024/11/Logo-resolve-1024x279.webp"
              alt="Resolve Logo"
              width={400}
              height={109}
              priority
              className="h-20 w-auto"
            />
          </motion.div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={staggerChildren}
              initial="initial"
              animate="animate"
              className="text-center md:text-left text-white"
            >
              <motion.h1
                variants={fadeInUp}
                className="text-2xl sm:text-5xl font-extrabold tracking-tight mb-6"
              >
                Indique amigos, acumule pontos e<br />
                <span className="text-primary">
                  concorra a um iPhone 15!
                </span>
              </motion.h1>
              <motion.p
                variants={fadeInUp}
                className="text-lg sm:text-xl text-gray-300 mb-8"
              >
                Cada indicação que se tornar cliente da Resolve conta como um ponto. Quem tiver mais pontos até 31/03/2025 leva um iphone para casa!              </motion.p>
              <motion.div variants={fadeInUp}>
                <Link href="/onboarding">
                  <Button size="lg" className="animate-pulse bg-primary text-black hover:bg-primary/90">
                    Quero meu iPhone! Indicar agora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateY: 15 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative mx-auto max-w-lg"
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
                  className="absolute -bottom-6 -right-6 bg-primary text-black px-6 py-3 rounded-full shadow-xl"
                >
                  <p className="text-lg font-bold">iPhone 15 Pro</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="py-24 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-white">Top 5 Ganhadores</h2>
            <p className="text-xl text-gray-400">
              Os participantes mais próximos de ganhar um iPhone 15
            </p>
          </motion.div>

          <div className="mb-20">
            <div className="relative h-[400px] flex items-end justify-center gap-4">
              {topParticipants.slice(0, 3).map((participant, index) => (
                <motion.div
                  key={participant.position}
                  initial={{ height: 0, opacity: 0 }}
                  whileInView={{ height: index === 1 ? "300px" : index === 0 ? "250px" : "200px", opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.5, ease: "backOut" }}
                  className="w-64 relative"
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
                      className="absolute -top-16 left-1/2 -translate-x-1/2"
                    >
                      <div className="relative">
                        <div className={`w-${index === 0 ? '24' : '20'} h-${index === 0 ? '24' : '20'} rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm border ${index === 0 ? "border-yellow-400/50" :
                          index === 1 ? "border-gray-400/50" :
                            "border-amber-400/50"
                          }`}>
                          {getPositionIcon(participant.position)}
                        </div>
                        <motion.div
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.7 + index * 0.2 }}
                          className={`absolute -top-2 -right-2 ${index === 0 ? "bg-yellow-500" :
                            index === 1 ? "bg-gray-400" :
                              "bg-amber-600"
                            } text-black w-8 h-8 rounded-full flex items-center justify-center font-bold`}
                        >
                          {participant.position}
                        </motion.div>
                      </div>
                      <div className="mt-2 text-center">
                        <h3 className={`text-white font-bold ${index === 0 ? 'text-xl' : ''}`}>{participant.name}</h3>
                        <p className={`${index === 0 ? "text-yellow-400 font-semibold" :
                          index === 1 ? "text-gray-400" :
                            "text-amber-400"
                          }`}>{participant.referrals} indicações</p>
                      </div>
                    </motion.div>
                  </div>
                  <div className={`absolute bottom-0 w-full text-center py-2 ${index === 0 ? "bg-yellow-500/20 border-yellow-400/30" :
                    index === 1 ? "bg-gray-500/20 border-gray-400/30" :
                      "bg-amber-500/20 border-amber-400/30"
                    } backdrop-blur-sm rounded-t-lg border-t`}>
                    {participant.position}º Lugar
                  </div>
                </motion.div>
              ))}
            </div>
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
            {topParticipants.slice(3).map((participant, index) => (
              <motion.div
                key={participant.position}
                variants={{
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.02, x: 10 }}
                className="relative overflow-hidden rounded-xl p-6 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20"
              >
                <motion.div
                  initial={false}
                  animate={{
                    width: `${(participant.referrals / topParticipants[0].referrals) * 100}%`
                  }}
                  className="absolute inset-0 bg-white/5"
                  style={{ originX: 0 }}
                  transition={{ duration: 1 }}
                />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                      className="flex items-center justify-center w-14 h-14 rounded-full bg-black/50 backdrop-blur-sm"
                    >
                      {getPositionIcon(participant.position)}
                    </motion.div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{participant.name}</h3>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Users className="w-4 h-4" />
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
                    <div className="text-3xl font-bold text-primary">#{participant.position}</div>
                    <div className="text-sm text-gray-400">posição</div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-black">Como Funciona</h2>
            <p className="text-xl text-gray-600">
              Três passos simples para concorrer ao iPhone 15
            </p>
          </motion.div>

          <motion.div
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            <motion.div
              variants={fadeInUp}
              whileHover={{ scale: 1.05, y: -5 }}
              className="text-center p-8 rounded-xl bg-black text-white hover:bg-black/90 transition-all"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-black mb-6">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Indique amigos</h3>
              <p className="text-gray-300 text-lg">
                Compartilhe seu link de indicação com amigos e familiares para começar.
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              whileHover={{ scale: 1.05, y: -5 }}
              className="text-center p-8 rounded-xl bg-black text-white hover:bg-black/90 transition-all"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-black mb-6">
                <Share2 className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Seus amigos contratam</h3>
              <p className="text-gray-300 text-lg">
                Cada amigo que fechar com a Resolve vira um ponto. Quanto mais amigos, mais chances!
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              whileHover={{ scale: 1.05, y: -5 }}
              className="text-center p-8 rounded-xl bg-black text-white hover:bg-black/90 transition-all"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-black mb-6">
                <Trophy className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Ganhe um iPhone 15</h3>
              <p className="text-gray-300 text-lg">
                O participante com mais indicações válidas até o prazo ganha um iPhone 15.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>


      <div className="py-24 bg-primary">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <motion.div
              variants={staggerChildren}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <motion.h2 variants={fadeInUp} className="text-4xl font-bold mb-6 text-black">O Prêmio</motion.h2>
              <motion.div variants={fadeInUp} className="space-y-4 text-lg text-black mb-8">
                <p>
                  Os 5 participantes que mais indicarem amigos ganharão um iPhone 15 128GB.
                </p>
                <ul className="space-y-2">
                  <motion.li variants={fadeInUp} className="flex items-center">
                    <Gift className="h-5 w-5 mr-2" />
                    Tela Super Retina XDR OLED de 6.1"
                  </motion.li>
                  <motion.li variants={fadeInUp} className="flex items-center">
                    <Gift className="h-5 w-5 mr-2" />
                    Câmera dupla de 48MP
                  </motion.li>
                  <motion.li variants={fadeInUp} className="flex items-center">
                    <Gift className="h-5 w-5 mr-2" />
                    Chip A16 Bionic
                  </motion.li>
                  <motion.li variants={fadeInUp} className="flex items-center">
                    <Gift className="h-5 w-5 mr-2" />
                    5G ultrarrápido
                  </motion.li>
                </ul>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Link href="/onboarding">
                  <Button size="lg" className="bg-black text-white hover:bg-black/90">
                    Entre no ranking! Indique agora
                    <Smartphone className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
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
                className="absolute -bottom-6 -right-6 bg-black text-white p-4 rounded-lg shadow-lg"
              >
                <p className="text-lg font-bold">Top 5 Ganham!</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Dúvidas Frequentes</h2>
            <p className="text-xl text-gray-600">
              Encontre respostas para as perguntas mais comuns
            </p>
          </motion.div>

          <motion.div
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem value="item-1" className="border rounded-lg px-6">
                <AccordionTrigger className="text-lg font-semibold">
                  Como funciona o sistema de indicações?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  Após se cadastrar, você receberá um código único. Compartilhe este código com amigos e familiares. Cada pessoa que se cadastrar usando seu código será contabilizada como uma indicação sua.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border rounded-lg px-6">
                <AccordionTrigger className="text-lg font-semibold">
                  Quem pode participar da promoção?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  Qualquer pessoa maior de 18 anos, residente no Brasil, pode participar da promoção. Não é necessário ser cliente da Resolve para participar.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border rounded-lg px-6">
                <AccordionTrigger className="text-lg font-semibold">
                  Até quando posso participar?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  A promoção está válida até 31/12/2025 ou enquanto durarem os estoques. Os vencedores serão anunciados em janeiro de 2026.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border rounded-lg px-6">
                <AccordionTrigger className="text-lg font-semibold">
                  Como sei se estou ganhando?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  Você pode acompanhar sua posição no ranking em tempo real através do painel de indicações. Os 5 primeiros colocados ganharão um iPhone 15.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border rounded-lg px-6">
                <AccordionTrigger className="text-lg font-semibold">
                  Como receberei o prêmio?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  Os vencedores serão contactados por email e telefone para combinar a entrega do iPhone 15. O prêmio será entregue em mãos na loja mais próxima da Resolve.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>
        </div>
      </div>

      <div className="bg-black text-white py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <h2 className="text-3xl font-bold mb-4">
            Não perca essa oportunidade!
          </h2>
          <p className="text-xl mb-8 text-gray-300">
            Quanto mais rápido você começar, maiores suas chances de ganhar.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/onboarding">
              <Button
                size="lg"
                className="animate-pulse bg-primary text-black hover:bg-primary/90"
              >
                Compartilhe e ganhe! Clique aqui
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <footer className="bg-black text-white pt-20 pb-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="col-span-1 lg:col-span-2"
            >
              <Image
                src="https://fortaleza-aldeota.resolvenergiasolar.com/wp-content/uploads/2024/11/Logo-resolve-1024x279.webp"
                alt="Resolve Logo"
                width={300}
                height={82}
                className="mb-6"
              />
              <p className="text-gray-400 mb-6">
                A Resolve é líder em soluções de energia solar, comprometida com a sustentabilidade e inovação. Nossa missão é tornar a energia solar acessível a todos.
              </p>
              <div className="flex space-x-4">
                <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                  <motion.div
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary hover:text-black transition-colors"
                  >
                    <Facebook className="w-5 h-5" />
                  </motion.div>
                </Link>
                <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  <motion.div
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary hover:text-black transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </motion.div>
                </Link>
                <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                  <motion.div
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary hover:text-black transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                  </motion.div>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold mb-4">Contato</h3>
              <div className="flex items-center space-x-3 text-gray-400">
                <Phone className="w-5 h-5" />
                <span>40048688</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400">
                <Mail className="w-5 h-5" />
                <span> ouvidoria@resolvenergiasolar.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400">
                <MapPin className="w-5 h-5" />
                <span>Av. Senador Lemos, 3809
                  Esquina com Alferes Costa</span>
              </div>
            </motion.div>


            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold mb-4">Horário de Funcionamento</h3>
              <div className="flex items-center space-x-3 text-gray-400">
                <Clock className="w-5 h-5" />
                <div>
                  <p>Segunda a Sexta</p>
                  <p>08:00 - 18:00</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-gray-400">
                <Clock className="w-5 h-5" />
                <div>
                  <p>Sábado</p>
                  <p>09:00 - 13:00</p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 text-center text-gray-400">
            <p>&copy; 2025 Resolve Energia Solar. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}