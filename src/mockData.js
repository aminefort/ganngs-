export const mockGang = null;

export const mockDealers = [
  {
    id: "weapons",
    name: "Arms Dealer",
    description: "High-quality weapons and ammunition",
    reputation: 75,
    maxReputation: 100,
    tasks: [
      {
        id: "collect_parts",
        title: "Collect Weapon Parts",
        description: "Gather weapon parts from various locations",
        rewards: {
          reputation: 10,
          coins: 5000
        },
        progress: 3,
        amount: 5,
        type: "collect"
      }
    ],
    upgrades: [
      {
        id: "weapon_quality",
        title: "Weapon Quality",
        description: "Improve the quality of available weapons",
        level: 2,
        levels: {
          3: {
            price: 25000,
            requiredReputation: 80
          },
          4: {
            price: 50000,
            requiredReputation: 90
          }
        }
      }
    ],
    shop: [
      {
        item: "pistol",
        title: "Combat Pistol",
        price: 15000
      },
      {
        item: "smg",
        title: "SMG",
        price: 25000
      }
    ]
  },
  {
    id: "vehicles",
    name: "Vehicle Dealer",
    description: "Premium vehicles and modifications",
    reputation: 50,
    maxReputation: 100,
    tasks: [],
    upgrades: [],
    shop: []
  }
];

export const mockZoneData = {
  playerPos: [0, 0],
  zones: {},
  gangs: {}
};

export const mockContracts = [
  {
    id: "heist_001",
    title: "Bank Heist",
    description: "Rob the central bank",
    price: 50000,
    starts: Date.now() + 3600000,
    reputation: [
      {
        dealer: "weapons",
        requiredRep: 50,
        has: true
      }
    ],
    tasks: [
      {
        dealer: "weapons",
        taskTitle: "Collect Parts",
        completed: true
      }
    ]
  }
];