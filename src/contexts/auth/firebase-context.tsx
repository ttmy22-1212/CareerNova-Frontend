"use client";

import type { User as FirebaseUser } from "@firebase/auth";
import {
  applyActionCode,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  FacebookAuthProvider,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  updateProfile,
  verifyPasswordResetCode,
} from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import type { FC, ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import UsersApi from "@/api/users";
import useAppSnackbar from "@/hooks/use-app-snackbar";
import { errorMap, firebaseApp } from "@/libs/firebase";
import { paths } from "@/paths";
import { RegisterValues } from "@/types/auth";
import type { User, UserOnboarding } from "@/types/user";
import {
  clearAuthData,
  getAuthData,
  handleAuthError,
  Issuer,
  storeAuthData,
} from "@/utils/auth";
import CookieHelper, { CookieKeys } from "@/utils/cookie-helper";

const auth = getAuth(firebaseApp);

// State Types
interface State {
  isInitialized: boolean;
  isAuthenticated: boolean;
  user: User | null;
}

enum ActionType {
  INITIALIZE = "INITIALIZE",
  SIGN_IN = "SIGN_IN",
  UPDATE = "UPDATE",
}

type UpdateAction = {
  type: ActionType.UPDATE;
  payload: {
    user: Partial<User>;
  };
};

type InitializeAction = {
  type: ActionType.INITIALIZE;
  payload: {
    isAuthenticated: boolean;
    user: User | null;
  };
};

type SignInAction = {
  type: ActionType.SIGN_IN;
  payload: {
    user: User;
  };
};

type Handler = (state: State, action: any) => State;
type Action = InitializeAction | SignInAction | UpdateAction;

const initialState: State = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
};

// Reducer and Handlers
const handlers: Record<ActionType, Handler> = {
  INITIALIZE: (state: State, action: InitializeAction): State => {
    const { isAuthenticated, user } = action.payload;

    return {
      ...state,
      isAuthenticated,
      isInitialized: true,
      user,
    };
  },
  SIGN_IN: (state: State, action: SignInAction): State => {
    const { user } = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      user,
    };
  },
  UPDATE: (state: State, action: UpdateAction): State => {
    const { user } = action.payload;
    return {
      ...state,
      isAuthenticated: true,
      user: state.user ? { ...state.user, ...user } : null,
    };
  },
};

const reducer = (state: State, action: Action): State =>
  handlers[action.type] ? handlers[action.type](state, action) : state;

// Context Types
export interface AuthContextType extends State {
  issuer: Issuer.Firebase;
  register: (value: RegisterValues) => Promise<any>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<any>;
  completeOnboarding: (values: UserOnboarding) => Promise<void>;

  signInWithEmailAndPassword: (
    email: string,
    password: string,
  ) => Promise<User | null>;
  signInWithGoogle: () => Promise<User | null>;
  signInWithFacebook: () => Promise<User | null>;
  signInAnonymously: () => Promise<User | null>;

  sendPasswordResetEmail: (email: string) => Promise<any>;
  verifyPasswordResetCode: (oobCode: string) => Promise<any>;
  confirmPasswordReset: (oobCode: string, newPassword: string) => Promise<any>;
  applyActionCode: (oobCode: string) => Promise<any>;
  sendEmailVerification: () => Promise<any>;

  signOut: () => Promise<void>;
  signOutAnonymously: () => Promise<void>;
  updateUser: (user: Partial<User>) => Promise<void>;
}

// Create Context with default values
export const AuthContext = createContext<AuthContextType>({
  ...initialState,
  issuer: Issuer.Firebase,
  register: () => Promise.resolve(),
  changePassword: () => Promise.resolve(),
  completeOnboarding: () => Promise.resolve(),

  signInWithEmailAndPassword: () => Promise.resolve(null),
  signInWithGoogle: () => Promise.resolve(null),
  signInWithFacebook: () => Promise.resolve(null),
  signInAnonymously: () => Promise.resolve(null),

  sendPasswordResetEmail: () => Promise.resolve(),
  verifyPasswordResetCode: () => Promise.resolve(),
  confirmPasswordReset: () => Promise.resolve(),
  applyActionCode: () => Promise.resolve(),
  sendEmailVerification: () => Promise.resolve(),

  signOut: () => Promise.resolve(),
  signOutAnonymously: () => Promise.resolve(),
  updateUser: () => Promise.resolve(),
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = (props) => {
  const router = useRouter();
  const pathname = usePathname();
  const { children } = props;
  const [state, dispatch] = useReducer(reducer, initialState);
  const [fbUser, setFbUser] = useState<FirebaseUser | null>(null);
  const [fbInitialized, setFbInitialized] = useState(false);
  const { showSnackbarError } = useAppSnackbar();

  const isDashboard =
    pathname.includes("/dashboard") ||
    pathname.includes("/forum") ||
    pathname.includes("/careers") ||
    pathname.includes("/profle") ||
    pathname.includes("/roadmap");

  const isAuth = pathname.includes("/auth");

  const getToken = useCallback(
    async (user: FirebaseUser): Promise<User> => {
      try {
        const idToken = await user.getIdToken();
        const response = await UsersApi.loginFirebase({ id_token: idToken });

        if (!response.token) {
          await auth.signOut();
          throw new Error("Get token failed!");
        }

        storeAuthData(response.token, response.data);

        dispatch({
          type: ActionType.SIGN_IN,
          payload: {
            user: response.data,
          },
        });
        setFbUser(user);
        return response.data;
      } catch (error) {
        handleAuthError(error);
        throw error;
      }
    },
    [dispatch],
  );

  const _signInAnonymously = useCallback(async (): Promise<User> => {
    try {
      const { user } = await signInAnonymously(auth);
      return await getToken(user);
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  }, [getToken]);

  const _signOutAnonymously = useCallback(async (): Promise<void> => {
    try {
      await signOut(auth);
      clearAuthData();
    } catch (error) {
      if (errorMap[(error as any).code]) {
        console.log(errorMap[(error as any).code]);
      }
    }
  }, []);

  const _signOut = useCallback(async (): Promise<void> => {
    try {
      await signOut(auth);
      dispatch({
        type: ActionType.INITIALIZE,
        payload: { isAuthenticated: false, user: null },
      });
      clearAuthData();
      _signInAnonymously();
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  }, []);

  /**
   * Periodically check if token exists to handle multi-tab signouts
   */
  const checkTokenInterval = useCallback(() => {
    // Only create an interval if the user is authenticated
    if (!state.isAuthenticated) {
      return () => {}; // Return empty cleanup function if not authenticated
    }

    const intervalId = setInterval(async () => {
      const accessToken = CookieHelper.getItem(CookieKeys.TOKEN, {
        domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined,
      });

      if (!accessToken) {
        try {
          await _signOut();
          if (isDashboard && !isAuth) {
            router.push(paths.auth.login);
            showSnackbarError("Vui lòng đăng nhập lại.");
          }
        } catch (error) {
          showSnackbarError(error);
        }
      }
    }, 2000);

    return () => clearInterval(intervalId);
  }, [_signOut, state.isAuthenticated, isDashboard, router, showSnackbarError]);

  useEffect(() => {
    const cleanup = checkTokenInterval();
    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isAuthenticated]);

  const initializeUserInfo = useCallback(async () => {
    try {
      const user = await UsersApi.me();

      if (!user?.id) {
        throw new Error("Invalid user data");
      }

      localStorage.setItem("user_data", JSON.stringify(user));
      return user;
    } catch (error) {
      await _signOut();
      if (isDashboard && !isAuth) {
        router.push(paths.auth.login);
      }
      throw new Error("Vui lòng đăng nhập lại");
    }
  }, [_signOut, router]);

  /**
   * Initialize auth state on app load
   */
  const initialize = useCallback(async (): Promise<void> => {
    try {
      const accessToken = CookieHelper.getItem(CookieKeys.TOKEN, {
        domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined,
      });

      if (!accessToken) {
        if (isDashboard) {
          const userData = await _signInAnonymously();
          dispatch({
            type: ActionType.INITIALIZE,
            payload: { isAuthenticated: true, user: userData },
          });
        }

        // dispatch({
        //   type: ActionType.INITIALIZE,
        //   payload: { isAuthenticated: false, user: null },
        // });
        // return;
      }

      // Get user from localStorage to reduce initial loading time
      let user = getAuthData();

      if (!user) {
        // If no cached user data, fetch from server immediately
        user = await initializeUserInfo();
      } else {
        // If cached data exists, refresh it in the background
        setTimeout(async () => {
          try {
            const updatedUser = await initializeUserInfo();
            dispatch({
              type: ActionType.UPDATE,
              payload: { user: updatedUser },
            });
          } catch (error) {
            showSnackbarError(error);
          }
        });
      }
      dispatch({
        type: ActionType.INITIALIZE,
        payload: { isAuthenticated: true, user },
      });
    } catch (err) {
      showSnackbarError(err);
      dispatch({
        type: ActionType.INITIALIZE,
        payload: { isAuthenticated: false, user: null },
      });
    }
  }, [_signInAnonymously, initializeUserInfo, isDashboard, showSnackbarError]);

  useEffect(
    () => {
      initialize();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const initFb = useCallback((user: FirebaseUser | null) => {
    setFbUser(user);
    setFbInitialized(true);
  }, []);

  useEffect(
    () => onAuthStateChanged(auth, initFb),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const completeOnboarding = useCallback(async (values: UserOnboarding) => {
    try {
      await UsersApi.userOnboarding(values);
      dispatch({
        type: ActionType.UPDATE,
        payload: {
          user: {
            onboarding_completed: true,
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }, []);

  const _signInWithEmailAndPassword = useCallback(
    async (email: string, password: string): Promise<User> => {
      try {
        const { user } = await signInWithEmailAndPassword(
          auth,
          email,
          password,
        );
        return await getToken(user);
      } catch (error) {
        handleAuthError(error);
        throw error;
      }
    },
    [getToken],
  );

  const signInWithGoogle = useCallback(async (): Promise<User> => {
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      return await getToken(user);
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  }, [getToken]);

  const signInWithFacebook = useCallback(async (): Promise<User> => {
    try {
      const provider = new FacebookAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      return await getToken(user);
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  }, [getToken]);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<void> => {
      try {
        const userInfo = state.user;
        if (!userInfo || !userInfo.email) {
          await initialize();
        }
        if (!userInfo || !userInfo.email) {
          throw new Error("Lỗi");
        }
        const { user } = await signInWithEmailAndPassword(
          auth,
          userInfo.email,
          currentPassword,
        );

        await updatePassword(user, newPassword);
      } catch (error) {
        handleAuthError(error);
        throw error;
      }
    },
    [initialize, state.user],
  );

  /**
   * Register a new user
   */
  const register = useCallback(async (value: RegisterValues) => {
    const { email, password, name } = value;
    try {
      // Create a user record without password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;
      await updateProfile(user, { displayName: name });
      await getToken(user);
      // await sendEmailVerification(user, {
      //   url: window.location.origin + paths.auth.login,
      // });
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  }, []);

  /**
   * Send email verification to current user
   */
  const _sendEmailVerification = useCallback(async () => {
    try {
      if (!fbUser) {
        throw new Error("Not logged in");
      }
      await sendEmailVerification(fbUser, {
        url: window.location.origin + paths.auth.login,
      });
      return true;
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  }, [fbUser]);

  const _sendPasswordResetEmail = useCallback(async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  }, []);

  const _verifyPasswordResetCode = useCallback(async (oobCode: string) => {
    try {
      await verifyPasswordResetCode(auth, oobCode);
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  }, []);

  const _confirmPasswordReset = useCallback(
    async (oobCode: string, newPassword: string) => {
      try {
        await confirmPasswordReset(auth, oobCode, newPassword);
      } catch (error) {
        handleAuthError(error);
        throw error;
      }
    },
    [],
  );

  /**
   * Apply Firebase action code (email verification, password reset, etc.)
   */
  const _applyActionCode = useCallback(
    async (oobCode: string) => {
      try {
        await applyActionCode(auth, oobCode);
        await _signOutAnonymously();
        await _signOut();
      } catch (error) {
        handleAuthError(error);
        throw error;
      }
    },
    [_signOut, _signOutAnonymously],
  );

  const updateUser = useCallback(async (user: Partial<User>) => {
    try {
      dispatch({
        type: ActionType.UPDATE,
        payload: {
          user: user,
        },
      });
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  }, []);

  /**
   * Check for mismatched Firebase and app auth states
   */
  useEffect(() => {
    if (state.user?.id && !fbUser && fbInitialized) {
      const forceSignOut = async () => {
        try {
          await _signOut();
          await _signOutAnonymously();
        } catch (err) {}
        if (!window.location.pathname.startsWith("/auth")) {
          showSnackbarError(
            "Thông tin xác thực không hợp lệ. Vui lòng đăng nhập lại",
          );
        }
        const returnTo = window.location.pathname + window.location.search;
        const url = new URL("/auth/login", window.location.origin);
        if (returnTo) {
          url.searchParams.set("returnTo", returnTo);
        }
      };
      const timeout = setTimeout(forceSignOut, 1500);
      return () => {
        clearTimeout(timeout);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, fbUser, fbInitialized]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        issuer: Issuer.Firebase,
        register,
        changePassword,
        completeOnboarding,

        signInWithEmailAndPassword: _signInWithEmailAndPassword,
        signInAnonymously: _signInAnonymously,
        signInWithGoogle,
        signInWithFacebook,

        sendPasswordResetEmail: _sendPasswordResetEmail,
        verifyPasswordResetCode: _verifyPasswordResetCode,
        confirmPasswordReset: _confirmPasswordReset,
        applyActionCode: _applyActionCode,
        sendEmailVerification: _sendEmailVerification,

        signOut: _signOut,
        signOutAnonymously: _signOutAnonymously,
        updateUser: updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
