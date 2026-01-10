export interface User {
  id: string;
  name: string;
  avatar?: string;
}

export const mockFollowers: User[] = [
  {
    id: '1',
    name: 'Baker A',
    avatar: 'https://i.pravatar.cc/100?img=1',
  },
  {
    id: '2',
    name: 'Baker B',
    avatar: 'https://i.pravatar.cc/100?img=2',
  },
  {
    id: '3',
    name: 'Baker C',
    avatar: 'https://i.pravatar.cc/100?img=3',
  },
];

export const mockFollowings: User[] = [
  {
    id: '1',
    name: 'Baker A',
    avatar: 'https://i.pravatar.cc/100?img=1',
  },
  {
    id: '2',
    name: 'Baker B',
    avatar: 'https://i.pravatar.cc/100?img=2',
  },
  {
    id: '3',
    name: 'Baker C',
    avatar: 'https://i.pravatar.cc/100?img=3',
  },
];