const { expect } = require("chai");
const { parseEther } = require("ethers/lib/utils");
require("dotenv").config();

describe("Greeter", function () {
  it("Should return the new greeting once it's changed", async function () {
    const signer = await hre.ethers.getSigner();

    const UniswapV2Factory = await ethers.getContractFactory(
      "UniswapV2Factory"
    );
    const UniswapV2Router02 = await ethers.getContractFactory(
      "UniswapV2Router02"
    );

    const DummyToken = await ethers.getContractFactory("DummyToken");

    const uniswapV2Factory = await UniswapV2Factory.deploy(signer.address);
    await uniswapV2Factory.deployed();

    const uniswapV2Router02 = await UniswapV2Router02.deploy(
      uniswapV2Factory.address,
      process.env.WETH
    );
    await uniswapV2Router02.deployed();

    const dummyToken = await DummyToken.deploy();
    await dummyToken.deployed();

    const dummyToken2 = await DummyToken.deploy();
    await dummyToken2.deployed();

    await (
      await uniswapV2Factory.createPair(dummyToken.address, dummyToken2.address)
    ).wait();

    await (
      await dummyToken.approve(uniswapV2Router02.address, parseEther("100.0"))
    ).wait();

    await (
      await dummyToken2.approve(uniswapV2Router02.address, parseEther("100.0"))
    ).wait();
    await (
      await uniswapV2Router02.addLiquidity(
        dummyToken.address,
        dummyToken2.address,
        parseEther("1.0"),
        parseEther("1.0"),
        parseEther("1.0"),
        parseEther("1.0"),
        signer.address,
        "99999999999"
      )
    ).wait();

    const pair = await uniswapV2Factory.getPair(
      dummyToken.address,
      dummyToken2.address
    );

    const abi = ["function approve(address, uint256) returns (bool)"];

    const lp = new ethers.Contract(pair, abi, signer);
    await (
      await lp.approve(uniswapV2Router02.address, parseEther("1000.0"))
    ).wait();
    await (
      await uniswapV2Router02.removeLiquidity(
        dummyToken.address,
        dummyToken2.address,
        parseEther("0.000000001"),
        parseEther("0.0"),
        parseEther("0.0"),
        signer.address,
        "99999999999"
      )
    ).wait();

    // expect(await greeter.greet()).to.equal("Hello, world!");

    // const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

    // // wait until the transaction is mined
    // await setGreetingTx.wait();

    // expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});
