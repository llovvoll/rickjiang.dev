---
title: 利用 Chainlink VRF 為智能合約產生安全的隨機數
date: '2022-06-06'
lastmod: '2022-06-06'
tags: ['solidity', 'smart contract']
draft: false
summary: 隨機數是生活中許多方面會應用的東西，或許只是沒有察覺到，譬如說資料安全、密碼、模擬計算或甚至是博彩遊戲，但是要取得到真正的隨機數其實很困難，現在主要有兩種類型分別為偽隨機數及真隨機數，這篇主要想來講講區塊鏈中的隨機數問題，在區塊鏈中主要使用到隨機數的應用就拿最近很熱門的 NFT 來說，項目方通常都會出 NFT 盲盒
images: []
authors: ['default']
layout: PostLayout
---

<TOCInline toc={props.toc} asDisclosure />

![](/static/images/2022/06/06/using-chainlink-vrf-for-randomness-generation/chainlink-vrf.png)

隨機數是生活中許多方面會應用的東西，或許只是沒有察覺到，譬如說資料安全、密碼、模擬計算或甚至是博彩遊戲，但是要取得到真正的隨機數其實很困難，現在主要有兩種類型分別為[偽隨機數](https://en.wikipedia.org/wiki/Pseudorandom_number_generator)及[真隨機數](https://en.wikipedia.org/wiki/Pseudorandom_number_generator)，想理解得更清楚可以點連結查看維基百科的詳細解釋

這篇主要想來講講區塊鏈中的隨機數問題，在區塊鏈中主要使用到隨機數的應用就拿最近很熱門的 NFT 來說，項目方通常都會出 NFT 盲盒，使用者在未開盒之前都不知道會抽到甚麼，所以隨機數很重要，但是鏈上的資料都會經過統一的驗證，所以其結果是可以被預測的，所以如果當項目的利益大於攻擊成本的話就很有可能被利用導致項目的損失，一般比較沒有這方面的警覺心的智能合約開發者或許會使用 Block Hash 及 Block Timestamp 做為產生偽隨機數的來源，但其實這兩個都可以被控制的，例如當一個礦工(驗證節點)私下建立一個驗證節點，不斷的與合約產生互動並直到得到他想要的結果再上傳至鏈上驗證即可達到操控隨機數，這方面的攻擊手段其實還有很多，篇幅有限，這篇就不多探討

如上所述，我們可以知道隨機數在智能合約應用上的重要性，所以今天就來講講如何在智能合約中取得到一個安全的真隨機數，今天會使用到的服務是 [Chainlink VRF](https://docs.chain.link/docs/chainlink-vrf/)，Chainlink 是在區塊鏈中非常知名的一家公司，其主要是提供預言機的服務，`Chainlink VRF (Verifiable Random Function) ` 則是他們公司的專門提供隨機數的一個產品，以下就紀錄說明一下如何使用這個服務

# 1. 取得測試 LINK Token & ETH

測試網路採用的是 Rinkeby，這邊可以到 Chainlink 提供的水龍頭領取 [Chainlink Faucet](https://faucets.chain.link/rinkeby)，一次可以領取到 20 LINK 及 0.1 ETH

# 2. 建立 Chainlink VRF 訂閱者

首先到 [Chainlink Subscription Manager](https://vrf.chain.link/?_ga=2.175932065.220816201.1654478207-782070902.1649906148) 點擊 `Create Subscription` 建立一個訂閱者帳戶

![](/static/images/2022/06/06/using-chainlink-vrf-for-randomness-generation/001.png)

完成之後回到 [Chainlink Subscription Manager](https://vrf.chain.link/?_ga=2.175932065.220816201.1654478207-782070902.1649906148) 頁面會看到 `My Subscriptions` 裡多了一個訂閱者，可以點擊 ID 進去並轉一些 LINK Token 到訂閱者帳戶裡面，待會使用產生隨機數時會使用到

![](/static/images/2022/06/06/using-chainlink-vrf-for-randomness-generation/002.png)

# 3. 編寫智能合約

這邊就以官方的範例程式來看，首先佈署合約時要帶入剛剛建立訂閱者 ID，接著在構造函數時會將 ID 儲存到 `s_subscriptionId`，接著根據 Chainlink VRF 合約地址建立一個 `VRFCoordinatorV2Interface` 的物件，各個網路的合約地址可以看[這邊](https://docs.chain.link/docs/vrf-contracts/#configurations) ，接著 `keyHash` 可以根據自己的需求選擇所需的 Gas Fee，但在 `Rinkeby` 只有 30 gwei 可以選擇，`callbackGasLimit` 則是當 Chainlink VRF 產生完隨機數後會呼叫 `fulfillRandomWords` 這個 callback ，每產生一組隨機數通常要 `20000`，但這邊也要包含到你的其它邏輯，所以這邊可以根據所需來設定，如果還不熟的話可以先以 `100000` 為預設值，`numWords` 則是請求幾組隨機數，這邊設定為 2 組，`requestConfirmations` 則是規定要幾個節點驗證過後才進行 callback ，越高越安全，這邊預設為 3 ，這邊要注意的是這個值在要根據每個合約規定的 Minimum 和 Maximum 來設定

以上完成後就可以佈署合約，佈署完成後將合約地址記起來備用

```solidity
// SPDX-License-Identifier: MIT
// An example of a consumer contract that relies on a subscription for funding.
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

contract VRFv2Consumer is VRFConsumerBaseV2 {
  VRFCoordinatorV2Interface COORDINATOR;

  // Your subscription ID.
  uint64 s_subscriptionId;

  // Rinkeby coordinator. For other networks,
  // see https://docs.chain.link/docs/vrf-contracts/#configurations
  address vrfCoordinator = 0x6168499c0cFfCaCD319c818142124B7A15E857ab;

  // The gas lane to use, which specifies the maximum gas price to bump to.
  // For a list of available gas lanes on each network,
  // see https://docs.chain.link/docs/vrf-contracts/#configurations
  bytes32 keyHash = 0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc;

  // Depends on the number of requested values that you want sent to the
  // fulfillRandomWords() function. Storing each word costs about 20,000 gas,
  // so 100,000 is a safe default for this example contract. Test and adjust
  // this limit based on the network that you select, the size of the request,
  // and the processing of the callback request in the fulfillRandomWords()
  // function.
  uint32 callbackGasLimit = 100000;

  // The default is 3, but you can set this higher.
  uint16 requestConfirmations = 3;

  // For this example, retrieve 2 random values in one request.
  // Cannot exceed VRFCoordinatorV2.MAX_NUM_WORDS.
  uint32 numWords =  2;

  uint256[] public s_randomWords;
  uint256 public s_requestId;
  address s_owner;

  constructor(uint64 subscriptionId) VRFConsumerBaseV2(vrfCoordinator) {
    COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
    s_owner = msg.sender;
    s_subscriptionId = subscriptionId;
  }

  // Assumes the subscription is funded sufficiently.
  function requestRandomWords() external onlyOwner {
    // Will revert if subscription is not set and funded.
    s_requestId = COORDINATOR.requestRandomWords(
      keyHash,
      s_subscriptionId,
      requestConfirmations,
      callbackGasLimit,
      numWords
    );
  }

  function fulfillRandomWords(
    uint256, /* requestId */
    uint256[] memory randomWords
  ) internal override {
    s_randomWords = randomWords;
  }

  modifier onlyOwner() {
    require(msg.sender == s_owner);
    _;
  }
}
```

# 4. 新增 Chainlink VRF 消費者

回到 [Chainlink Subscription Manager](https://vrf.chain.link/?_ga=2.175932065.220816201.1654478207-782070902.1649906148) 進到剛剛建立的訂閱者中點擊 `Add consumer` 將剛剛佈署的合約地址貼上來並新增

![](/static/images/2022/06/06/using-chainlink-vrf-for-randomness-generation/003.png)

# 5. 測試產生隨機數

佈署完合約及加入消費者後即可呼叫 `requestRandomWords` 函數來產生隨機數，呼叫完後可以在 [Chainlink Subscription Manager](https://vrf.chain.link/?_ga=2.175932065.220816201.1654478207-782070902.1649906148) 看到正在運行的工作及狀態，如果運行上正常的話就會看到 `s_requestId` 及 `s_randomWords` 更新了

![](/static/images/2022/06/06/using-chainlink-vrf-for-randomness-generation/004.png)

![](/static/images/2022/06/06/using-chainlink-vrf-for-randomness-generation/005.png)

以上就是如何使用 Chainlink VRF 產生安全的隨機數，當然雖然產生的隨機數是安全的，但如果智能合約開發時沒有注意到一些 Bug 還是會可能有被攻擊的機會，建議可以看看 [VRF Best Practices](https://docs.chain.link/docs/chainlink-vrf-best-practices/) 一文
