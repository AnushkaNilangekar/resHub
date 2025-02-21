import CustomTopTabNavigator from './CustomTopTabNavigator';
import MatchesScreen from '../screens/MatchesScreen';
import ChatScreen from '../screens/ChatScreen';

const MatchesChatTabNavigator = () => {
  const tabs = [
    { name: 'Matches', component: <MatchesScreen /> },
    { name: 'Conversations', component: <ChatScreen /> },
  ];

  return <CustomTopTabNavigator tabs={tabs} />;
};

export default MatchesChatTabNavigator;