import { useState } from 'react'
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
  // Auth gate
  const [authed, setAuthed] = useState(false)

  const [appState, setAppState] = useState<AppState>('splash')
  const [userData, setUserData] = useState<UserData>({})

  // 1) Block app until authenticated
  if (!authed) {
    return <AuthGate onAuthed={() => setAuthed(true)} />
  }

  const handleSplashComplete = () => {
    setAppState('onboarding-parent')
  }

  const handleParentComplete = (data: ParentData) => {
    setUserData((prev) => ({ ...prev, parent: data }))
    setAppState('onboarding-child')
  }

  const handleChildComplete = (data: ChildData) => {
    setUserData((prev) => ({ ...prev, child: data }))
    setAppState('onboarding-home')
  }

  const handleHomeComplete = (data: HomeData) => {
    setUserData((prev) => ({ ...prev, home: data }))
    // Aquí luego guardaremos en backend
    setAppState('home')
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
            onNavigate={handleNavigate}
          />
        )

      case 'moments':
        return (
          <>
            <MomentsKids
              onBack={handleBackToHome}
              onAddMoment={() => {
                console.log('Agregar momento')
              }}
            />
            <BottomNav currentRoute="moments" onNavigate={handleNavigate} />
          </>
        )

      case 'explore':
        return (
          <>
            <Explore onBack={handleBackToHome} />
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
                setUserData({})
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

  return <div className="App">{renderCurrentScreen()}</div>
}

export default App

