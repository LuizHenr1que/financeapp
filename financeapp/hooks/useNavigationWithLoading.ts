import { useRouter } from 'expo-router';
import { useLoading } from '@/context/LoadingContext';

export function useNavigationWithLoading() {
  const router = useRouter();
  const { showLoading, hideLoading } = useLoading();

  const navigateTo = async (href: string, delay: number = 800) => {
    showLoading();
    
    // Simula um pequeno delay para mostrar o loading
    setTimeout(() => {
      router.push(href as any);
      hideLoading();
    }, delay);
  };

  const navigateBack = async (delay: number = 500) => {
    showLoading();
    
    setTimeout(() => {
      router.back();
      hideLoading();
    }, delay);
  };

  const navigateReplace = async (href: string, delay: number = 800) => {
    showLoading();
    
    setTimeout(() => {
      router.replace(href as any);
      hideLoading();
    }, delay);
  };

  return {
    navigateTo,
    navigateBack,
    navigateReplace,
  };
}
