
import React from 'react';
import { Cloud } from 'lucide-react';
import { motion } from 'framer-motion';

const CompanyHeader: React.FC = () => {
  return (
    <div className="text-center relative z-10 mb-10">
      <motion.div
        animate={{ 
          y: [0, -10, 0],
          rotateZ: [0, 2, -2, 0]
        }}
        transition={{ 
          repeat: Infinity,
          duration: 6,
          ease: "easeInOut" 
        }}
        className="bg-ghibli-meadow/30 backdrop-blur-md rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto mb-4"
      >
        <Cloud className="h-12 w-12 text-white" />
      </motion.div>
      
      <div className="bg-black/40 backdrop-blur-lg p-6 rounded-2xl inline-block">
        <motion.h1 
          className="text-4xl md:text-5xl font-handwritten text-white mb-4 drop-shadow-lg"
          animate={{ 
            scale: [1, 1.03, 1],
          }}
          transition={{ 
            repeat: Infinity,
            duration: 5,
            ease: "easeInOut" 
          }}
        >
          Aigongbu
        </motion.h1>
        
        <p className="text-xl text-white italic mb-6">
          "인터넷 강의 및 AI와 함께 공부"
        </p>
      </div>
      
      <motion.div 
        className="mt-8 max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        <div className="bg-white/30 backdrop-blur-md p-6 rounded-xl">
          <p className="mb-4 leading-relaxed text-white font-medium drop-shadow-sm">
            Aigongbu는 혁신적인 교육 플랫폼으로, 전통적인 강의와 최첨단 AI 기술을 결합하여 
            학습자들에게 개인 맞춤형 학습 경험을 제공합니다.
          </p>
          <p className="leading-relaxed text-white font-medium drop-shadow-sm">
            우리는 모든 사람이 자신의 잠재력을 최대한 발휘할 수 있도록 지원하는 
            교육 생태계를 구축하기 위해 노력하고 있습니다.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default CompanyHeader;
