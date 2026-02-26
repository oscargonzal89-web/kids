import { useState, useEffect } from 'react'
import './styles/globals.css'

import AuthGate from './pages/AuthGate'

import { SplashScreen } from './components/SplashScreen'
import { OnboardingParent, ParentData } from './components/OnboardingParent'
import { OnboardingChild, ChildData } from './components/OnboardingChild'
import { OnboardingHome, HomeData } from './components/OnboardingHome'
import { Home } from './components/Home'
import { Chat } from './components/Chat'
import { MomentsKids } from './components/MomentsKids'
import { Explore } from './components/Explore'
import { Profile } from './components/Profile'
import { BottomNav } from './components/BottomNav'

import { getProfile, upsertProfile } from './services/profile.service'
import { getChildren, insertChild } from './services/children.service'
import { getFamilyContext, upsertFamilyContext } from './services/familyContext.service'
import { signOut as authSignOut } from './services/auth.service'

type AppState =
  | 'splash'
  | 'onboarding-parent'
  | 'onboarding-child'
  | 'onboarding-home'
  | 'home'
  | 'chat'
  | 'moments'
  | 'explore'
  | 'profile'

interface UserData {
  parent?: ParentData
  child?: ChildData
  home?: HomeData
}

function App() {
  const [authed, setAuthed] = useState(false)
  const [loading, setLoading] = useState(true)

  const [appState, setAppState] = useState<AppState>('splash')
  const [userData, setUserData] = useState<UserData>({})
  const [firstChildId, setFirstChildId] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Load profile, children, family_context when authed and set initial screen
  useEffect(() => {
    if (!authed) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    Promise.all([getProfile(), getChildren(), getFamilyContext()])
      .then(([profile, children, familyContext]) => {
        if (cancelled) return
        const parent: ParentData | undefined = profile
          ? { name: profile.name ?? '', email: profile.email ?? '', relationship: profile.relationship ?? '' }
          : undefined
        const firstChild = children[0]
        const child: ChildData | undefined = firstChild
          ? {
              name: firstChild.name,
              nickname: firstChild.nickname ?? '',
              birthDate: firstChild.birthdate ?? '',
              favoriteColor: (firstChild.favorites as { color?: string }).color ?? '',
              favoriteAnimal: (firstChild.favorites as { animal?: string }).animal ?? '',
              city: familyContext?.city ?? '',
            }
          : undefined
        const home: HomeData | undefined = familyContext
          ? {
              hasPets: Array.isArray(familyContext.pets) && familyContext.pets.length > 0,
              sleepTime: familyContext.sleep_time ?? '',
              mealTime: familyContext.meal_time ?? '',
            }
          : undefined
        setUserData({ parent, child, home })
        setFirstChildId(firstChild?.id ?? null)
        if (!profile) setAppState('splash')
        else if (!firstChild) setAppState('onboarding-child')
        else if (!familyContext) setAppState('onboarding-home')
        else setAppState('home')
      })
      .catch((err) => {
        if (!cancelled) console.error('Error loading user data:', err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [authed])

  if (!authed) {
    return <AuthGate onAuthed={() => setAuthed(true)} />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="text-gray-600 font-nunito">Cargando...</p>
      </div>
    )
  }

  const handleSplashComplete = () => {
    setAppState('onboarding-parent')
  }

  const handleParentComplete = async (data: ParentData) => {
    setSaveError(null)
    try {
      await upsertProfile({ name: data.name, email: data.email, relationship: data.relationship })
      setUserData((prev) => ({ ...prev, parent: data }))
      setAppState('onboarding-child')
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Error al guardar')
    }
  }

  const handleChildComplete = async (data: ChildData) => {
    setSaveError(null)
    try {
      const row = await insertChild({
        name: data.name,
        nickname: data.nickname || undefined,
        birthdate: data.birthDate,
        favorites: { color: data.favoriteColor, animal: data.favoriteAnimal },
      })
      setUserData((prev) => ({ ...prev, child: data }))
      setFirstChildId(row.id)
      setAppState('onboarding-home')
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Error al guardar')
    }
  }

  const handleHomeComplete = async (data: HomeData) => {
    setSaveError(null)
    try {
      await upsertFamilyContext({
        city: userData.child?.city ?? null,
        pets: data.hasPets ? [{}] : [],
        sleep_time: data.sleepTime || null,
        meal_time: data.mealTime || null,
      })
      setUserData((prev) => ({ ...prev, home: data }))
      setAppState('home')
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Error al guardar')
    }
  }

  const handleNavigate = (route: string) => {
    switch (route) {
      case 'home':
        setAppState('home')
        break

      case 'chat':
        setAppState('chat')
        break

      case 'moments':
        setAppState('moments')
        break

      case 'explore':
        setAppState('explore')
        break

      case 'profile':
        setAppState('profile')
        break

      case 'diary':
        setAppState('moments')
        break

      case 'agenda':
        // TODO: Implementar pantalla de agenda
        break

      case 'community':
        setAppState('explore')
        break

      case 'marketplace':
        setAppState('explore')
        break

      default:
        break
    }
  }

  const handleBackToHome = () => {
    setAppState('home')
  }

  const renderCurrentScreen = () => {
    switch (appState) {
      case 'splash':
        return <SplashScreen onStart={handleSplashComplete} />

      case 'onboarding-parent':
        return <OnboardingParent onNext={handleParentComplete} />

      case 'onboarding-child':
        return (
          <OnboardingChild
            onNext={handleChildComplete}
            parentName={userData.parent?.name}
          />
        )

      case 'onboarding-home':
        return (
          <OnboardingHome
            onComplete={handleHomeComplete}
            childName={userData.child?.name || userData.child?.nickname}
          />
        )

      case 'home':
        return (
          <>
            <Home
              parentName={userData.parent?.name}
              childName={userData.child?.name || userData.child?.nickname}
              onChatWithNani={() => setAppState('chat')}
              onNavigate={handleNavigate}
            />
            <BottomNav currentRoute="home" onNavigate={handleNavigate} />
          </>
        )

      case 'chat':
        return (
          <Chat
            parentName={userData.parent?.name}
            childName={userData.child?.name || userData.child?.nickname}
            childId={firstChildId ?? undefined}
            onNavigate={handleNavigate}
          />
        )

      case 'moments':
        return (
          <>
            <MomentsKids
              onBack={handleBackToHome}
              onAddMoment={() => {}}
              childId={firstChildId ?? undefined}
            />
            <BottomNav currentRoute="moments" onNavigate={handleNavigate} />
          </>
        )

      case 'explore':
        return (
          <>
            <Explore onBack={handleBackToHome} childId={firstChildId ?? undefined} />
            <BottomNav currentRoute="explore" onNavigate={handleNavigate} />
          </>
        )

      case 'profile':
        return (
          <>
            <Profile
              parentName={userData.parent?.name}
              childName={userData.child?.name || userData.child?.nickname}
              onBack={handleBackToHome}
              onLogout={() => {
                authSignOut()
                setUserData({})
                setSaveError(null)
                setAuthed(false)
                setAppState('splash')
              }}
            />
            <BottomNav currentRoute="profile" onNavigate={handleNavigate} />
          </>
        )

      default:
        return <SplashScreen onStart={handleSplashComplete} />
    }
  }

  return (
    <div className="App">
      {saveError && (
        <div className="bg-red-100 text-red-800 px-4 py-2 text-center text-sm font-nunito">
          {saveError}
        </div>
      )}
      {renderCurrentScreen()}
    </div>
  )
}

export default App

