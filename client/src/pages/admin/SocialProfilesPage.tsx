import AdminLayout from '@/components/admin/AdminLayout';
import SocialProfilesManager from '@/components/admin/SocialProfilesManager';
import SEOHead from '@/components/ui/seo-head';

export default function SocialProfilesPage() {
  return (
    <>
      <SEOHead
        title="Social Media Profiles | Admin Dashboard"
        description="Manage your social media profiles and connections"
        robots="noindex,nofollow"
      />
      <AdminLayout>
        <SocialProfilesManager />
      </AdminLayout>
    </>
  );
}