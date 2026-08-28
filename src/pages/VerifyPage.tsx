import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';

export default function VerifyPage() {
  const navigate = useNavigate();
  const { setUserType } = useAppStore();
  
  useEffect(() => {
    setUserType('consumer');
    navigate('/consumer', { replace: true });
  }, []);

  return null;
}
