import type { Wallet } from '../types'

export const Wallets: Wallet[] = [
  {
    id: 1,
    name: 'Findy Web Wallet',
    organization: 'Findy Agency',
    recommended: true,
    icon: `${process.env.WALLET_URL}/img/logo.svg`,
    url: process.env.WALLET_URL || '',
    //apple: 'https://apps.apple.com/us/app/lissi-wallet/id1529848685',
    //android: 'https://play.google.com/store/apps/details?id=io.lissi.mobile.android',
  },
  // {
  //   id: 1,
  //   name: 'Lissi Wallet',
  //   organization: 'Main Incubator GmbH',
  //   recommended: true,
  //   icon: '/public/wallets/icon-lissi.jpeg',
  //   url: 'http://onelink.to/jhrpj6',
  //   apple: 'https://apps.apple.com/us/app/lissi-wallet/id1529848685',
  //   android: 'https://play.google.com/store/apps/details?id=io.lissi.mobile.android',
  // },
  // {
  //   id: 2,
  //   name: 'Trinsic Wallet',
  //   organization: 'Trinsic',
  //   recommended: false,
  //   icon: '/public/wallets/icon-trinsic.jpeg',
  //   url: 'http://onelink.to/ypth69',
  //   apple: 'https://apps.apple.com/us/app/streetcred-identity-agent/id1475160728',
  //   android: 'https://play.google.com/store/apps/details?id=id.streetcred.apps.mobile',
  //   ledgerImage: 'https://i.imgur.com/SINVCJv.png',
  // },
]
