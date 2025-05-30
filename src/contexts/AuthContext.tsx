// AuthContext.tsx

import React, {createContext, type ReactNode, useContext, useEffect, useState,} from 'react';
import {toast} from 'sonner';
import {tokenManager} from '@/utils/tokenManager';
import {authAPI} from '@/api/auth';
import type {RegisterRequest, User} from '@/types/auth';
import {FormErrors} from "@/components/forms/RegistrationForm.types";
import {getFcmToken} from "@/utils/firebase.ts";


interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, onSuccess?: () => void) => Promise<boolean>;
  forceLogin: (email: string, password: string, onSuccess?: () => void) => Promise<boolean>;
  register: (
      form: RegisterRequest,
      onSuccess?: (field: keyof FormErrors, message: string) => void,
      setErrors?: React.Dispatch<React.SetStateAction<FormErrors>>
  ) => Promise<boolean>;
  logout: () => void;
  loginWithSocialMedia: (provider: 'google' | 'naver' | 'kakao') => void;
  updateUserFromToken: () => Promise<void>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // ✅ 비동기 업데이트
  const updateUserFromToken = async () => {
    const userInfo = tokenManager.getUserInfo(); // 토큰에서 유저 정보 파싱
    setUser(userInfo || null);

      try {
        const fcmToken = await getFcmToken();
        if (fcmToken) {
          await authAPI.registerPushToken({ fcmToken });
          console.log('✅ FCM 토큰 등록 완료');
        }
      } catch (err) {
        console.error('❌ FCM 토큰 등록 실패:', err);
      }

  };

  useEffect(() => {
    if (tokenManager.getToken()) {
      updateUserFromToken();
    }
  }, []);

  const login = async (email: string, password: string, onSuccess?: () => void): Promise<boolean> => {
    try {
      const { data } = await authAPI.login({ email, password });

      if (data?.loggedIn && data.accessToken) {
        tokenManager.setToken(data.accessToken);
        await updateUserFromToken(); // ✅ await 붙임
        toast.success(data.message || '로그인 성공!');
        onSuccess?.();
        return true;
      }

      toast.error(data.message || '로그인에 실패했습니다.');
      return false;
    } catch (error: any) {
      const status = error.response?.status;
      const msg = error.response?.data?.message;

      if (status === 409) {
        const confirmed = window.confirm(msg || '다른 브라우저에서 로그인됨. 강제 로그인하시겠습니까?');
        if (confirmed) {
          return await forceLogin(email, password, onSuccess);
        }
      } else {
        toast.error(msg || '로그인 중 오류 발생');
      }

      return false;
    }
  };


  const forceLogin = async (email: string, password: string, onSuccess?: () => void): Promise<boolean> => {
    try {
      const { data } = await authAPI.forceLogin({ email, password });

      if (data?.loggedIn && data.accessToken) {
        tokenManager.setToken(data.accessToken);
        await updateUserFromToken(); // ✅ await 붙임
        toast.success(data.message || '강제 로그인 성공!');
        onSuccess?.();
        return true;
      }

      toast.error(data?.message || '강제 로그인 실패');
      return false;
    } catch (error: any) {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 401) {
        toast.error(message || '이메일 또는 비밀번호 오류');
      } else {
        toast.error(message || '강제 로그인 중 오류 발생');
      }

      return false;
    }
  };

  const register = async (
      form: RegisterRequest,
      onMessage?: (field: keyof FormErrors, message: string) => void,
      setErrors?: React.Dispatch<React.SetStateAction<FormErrors>>
  ): Promise<boolean> => {
    try {
      const formData = new FormData();
      const userPayload = {
        email: form.email,
        password: form.password,
        nickname: form.nickname,
      };

      formData.append('user', new Blob([JSON.stringify(userPayload)], { type: 'application/json' }));

      if (form.profileImage) {
        formData.append('profileImage', form.profileImage);
      }

      const { data } = await authAPI.register(formData);

      if (data?.success) {
        if (data.accessToken) {
          tokenManager.setToken(data.accessToken);
          await updateUserFromToken(); // ✅ await 붙임
        }
        toast.success(data.message || '회원가입 성공!');
        return true;
      }

      if (data.errors && setErrors) {
        setErrors((prev) => ({ ...prev, ...data.errors }));
      }

      if (!data.errors && data.message && onMessage) {
        onMessage('nicknameError', data.message);
      }

      toast.error(data.message || '회원가입 실패');
      return false;
    } catch (error: any) {
      const responseData = error?.response?.data;

      if (responseData?.errors && setErrors) {
        setErrors((prev) => ({ ...prev, ...responseData.errors }));
      }

      if (!responseData?.errors && responseData?.message && onMessage) {
        onMessage('nicknameError', responseData.message);
      }

      toast.error(responseData?.message || '회원가입 중 오류 발생');
      return false;
    }
  };


  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenManager.clearTokens();
      setUser(null);
      toast.info('로그아웃 되었습니다.');
    }
  };

  const loginWithSocialMedia = (provider: 'google' | 'naver' | 'kakao') => {
    window.location.href = `/oauth2/authorization/${provider}`;
  };

  const value: AuthContextType = {
    user,
    login,
    forceLogin,
    register,
    logout,
    loginWithSocialMedia,
    updateUserFromToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
