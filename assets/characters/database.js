/*
 * Character database for the endorsement NPC dialogue.
 *
 * profilePic.mode:
 *   "random"  picks a portrait from the matching gender pool
 *   "specific" uses profilePic.file directly
 *
 * Keep portrait filenames in assets/pixel-npc and use gender suffixes
 * (_M, _F, or -M) so the random resolver can keep assignments coherent.
 */
window.CHARACTERS = [
  {
    name: 'Andres Gomez',
    gender: 'M',
    role: 'App Developer | RUTZ Studios',
    preview: 'Abhishek consistently showcased technical prowess, dedication to the craft, and creativity that enhanced our character designs.',
    endorsement: 'I had the pleasure of working with Abhishek at RUTZ Studios, where he served as our 3D artist, specializing in crafting low-poly outfits for our character designs. Throughout his tenure with us, Abhishek consistently showcased not only his technical prowess but also his dedication to the craft. His creativity, combined with the right guidance, led to some of the most innovative and aesthetically pleasing designs that greatly enhanced our projects.',
    profilePic: { mode: 'random', gender: 'M' }
  },
  {
    name: 'Antoine Le Flamanc',
    gender: 'M',
    role: 'Head of Procurement & Founder | Turbowares AI',
    preview: 'Abhishek brought a can-do attitude, learned quickly on the job, and delivered 3D modeling, animation, and scene composition to expectations.',
    endorsement: "Abhishek joined Ant One Entertainment on 2 projects requiring 3D modeling, 3D animation and scene composition jobs. Abhishek's hardwork and can do attitude were deeply appreciated as well as his capacity to self learn on the job. His contribution to the projects were totally at the level of the expectation and I have no doubt of Abhishek bright future given his mindset and openness to new ideas.",
    profilePic: { mode: 'random', gender: 'M' }
  },
  {
    name: 'Zaid Kamal',
    gender: 'M',
    role: 'Game Developer | Creative Technology',
    preview: 'Abhishek is a smart working individual with a knack for sculpting creative models and bringing out the best details in his creations.',
    endorsement: 'Abhishek is a smart working individual with great skills and experience. He has a knack for sculpting creative models and gives his best to bring out the best details in his creations. He has hands-on almost all creative 3D engines and is ready to learn any given subject due to his curious attitude. He is poised to become a great 3D artist in the future.',
    profilePic: { mode: 'random', gender: 'M' }
  },
  {
    name: 'Breno Azevedo',
    gender: 'M',
    role: 'Veteran Game Developer, Balance Designer & Producer',
    preview: 'Abhishek was polite and timely, took feedback seriously, and did his best to deliver work that kept the client satisfied.',
    endorsement: "When he did some 3D modeling work for me, Abhishek has been very polite and timely, doing his best to keep me satisfied. He also takes feedback and suggestions very seriously, and tried to implement them. I'll definitely do work with Abhishek in the future!",
    profilePic: { mode: 'random', gender: 'M' }
  }
];

window.NPC_PORTRAITS = {
  M: [
    'Zeth_M.png',
    'Rick_M.png',
    'Owel_M.png',
    'Mark_M.png',
    'Lucas_M.png',
    'Knight_M.png',
    'John-M.png',
    'Zoe_M.png'
  ],
  F: [
    'Olla_F.png',
    'Emma_F.png',
    'Clara_F.png',
    'Chole_F.png'
  ]
};
