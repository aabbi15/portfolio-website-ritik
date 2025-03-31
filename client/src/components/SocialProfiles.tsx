import { useQuery } from '@tanstack/react-query';
import { SocialProfile } from '@shared/schema';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaTwitter, FaFacebook, FaInstagram, FaYoutube, FaTiktok, FaDev, FaMedium, FaGlobe } from 'react-icons/fa';

/**
 * Component to display social media profiles
 */
export default function SocialProfiles({ className = "" }: { className?: string }) {
  // Query to fetch social profiles
  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['/api/social-profiles'],
    queryFn: async () => {
      const response = await fetch('/api/social-profiles');
      if (!response.ok) throw new Error('Failed to fetch social profiles');
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className={`flex gap-3 ${className}`}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
        ))}
      </div>
    );
  }

  // Only show connected profiles
  const activeProfiles = profiles.filter((profile: SocialProfile) => profile.isConnected);

  if (activeProfiles.length === 0) {
    return null;
  }

  // Map platform names to icons
  const getIconForPlatform = (platform: string) => {
    const iconSize = 20;
    switch (platform.toLowerCase()) {
      case 'github':
        return <FaGithub size={iconSize} />;
      case 'linkedin':
        return <FaLinkedin size={iconSize} />;
      case 'twitter':
        return <FaTwitter size={iconSize} />;
      case 'facebook':
        return <FaFacebook size={iconSize} />;
      case 'instagram':
        return <FaInstagram size={iconSize} />;
      case 'youtube':
        return <FaYoutube size={iconSize} />;
      case 'tiktok':
        return <FaTiktok size={iconSize} />;
      case 'dev.to':
      case 'devto':
        return <FaDev size={iconSize} />;
      case 'medium':
        return <FaMedium size={iconSize} />;
      default:
        return <FaGlobe size={iconSize} />;
    }
  };

  // Get platform-specific color for hover effects
  const getColorForPlatform = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'github':
        return 'hover:text-gray-800 dark:hover:text-white';
      case 'linkedin':
        return 'hover:text-blue-600';
      case 'twitter':
        return 'hover:text-blue-400';
      case 'facebook':
        return 'hover:text-blue-700';
      case 'instagram':
        return 'hover:text-pink-600';
      case 'youtube':
        return 'hover:text-red-600';
      case 'tiktok':
        return 'hover:text-black dark:hover:text-white';
      case 'dev.to':
      case 'devto':
        return 'hover:text-black dark:hover:text-white';
      case 'medium':
        return 'hover:text-green-600';
      default:
        return 'hover:text-primary';
    }
  };

  // Animation variants for staggered animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 10
      }
    }
  };

  return (
    <motion.div 
      className={`flex flex-wrap gap-4 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {activeProfiles.map((profile: SocialProfile) => (
        <motion.a
          key={profile.id}
          href={profile.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Visit ${profile.platform} profile`}
          className={`w-9 h-9 bg-gray-700/50 hover:bg-primary text-gray-300 flex items-center justify-center rounded-full transition-colors duration-300 ${getColorForPlatform(profile.platform)}`}
          title={profile.displayName || profile.username || profile.platform}
          variants={itemVariants}
          whileHover={{ 
            scale: 1.1, 
            rotate: 5,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.9 }}
        >
          {getIconForPlatform(profile.platform)}
        </motion.a>
      ))}
    </motion.div>
  );
}