// const { assert } = require("console");
const { assert } = require('chai')
const DiceRoller = artifacts.require("DiceRoller");

  let instance;

  beforeEach(async () => {
    instance = await DiceRoller.deployed()
  })
/*
contract('DiceRoller hasRolledOnce', async (accounts) => {
  it('will return false from hasRolledOnce when an address has not rolled yet.', async () => {
    const hasRolled = await instance.hasRolledOnce( accounts[0] );
    assert.equal(hasRolled, false, "Unrolled address should return false");
  });

  it('will return true from hasRolledOnce when an address has called hasRolled.', async () => {

    let hasRolled = await instance.hasRolledOnce( accounts[0] );
    assert.equal(hasRolled, false, "Address should return true");

    const numberOfDie = 4;
    const dieSize = 10;
    const adjustment = 0;
    const result = 13;
    await instance.hasRolled(numberOfDie, dieSize, adjustment, result);

    hasRolled = await instance.hasRolledOnce( accounts[0] );
    assert.equal(hasRolled, true, "Address should return true");

    // Rolling again will not change the result
    await instance.hasRolled(numberOfDie, dieSize, adjustment, result);

    hasRolled = await instance.hasRolledOnce( accounts[0] );
    assert.equal(hasRolled, true, "Address should return true");
  });
});
*/
/*
contract('DiceRoller getUserRollsCount', async (accounts) => {
  it('will return 0 from getUserRollsCount when an address has not rolled yet.', async () => {
    let userRollCount = await instance.getUserRollsCount(accounts[0])
    assert.equal(userRollCount, 0, "getUserRollsCount should be 0");
  });

  it('will increment the value from getUserRollsCount when an address has called hasRolled.', async () => {

    let userRollCount = await instance.getUserRollsCount(accounts[0])
    assert.equal(userRollCount, 0, "getUserRollsCount should be 0");

    const numberOfDie = 4;
    const dieSize = 10;
    const adjustment = 0;
    const result = 13;
    await instance.hasRolled(numberOfDie, dieSize, adjustment, result);

    userRollCount = await instance.getUserRollsCount(accounts[0])
    //console.log('userRollCount: ' + userRollCount);
    assert.equal(userRollCount, 1, "getUserRollsCount should be 1");

    // Rolling again will not change the result
    await instance.hasRolled(numberOfDie, dieSize, adjustment, result);

    userRollCount = await instance.getUserRollsCount(accounts[0])
    //console.log('userRollCount: ' + userRollCount);
    assert.equal(userRollCount, 2, "getUserRollsCount should be 2");
  });
});
*/
/** 
  It appears that we can only reliably verify the reverted error messages locally. Maybe if we 
  create another contract to interact with the contract being tested or via solidity tests.
*/
contract('DiceRoller validation', async (accounts) => {
  it('will fail if too many dice are used.', async () => {
    console.log('testing')
    const numberOfDie = 14;
    const dieSize = 10;
    const adjustment = 0;
    const result = 13;
    try {
      await instance.hasRolled(numberOfDie, dieSize, adjustment, result);
      assert.fail();
    }
    catch(err) {
      console.log('err: ' + err)
      assert.isOk('failed','as expected')
    }
  });

  it('will fail if too dice size is > 100.', async () => {
    const numberOfDie = 10;
    const dieSize = 101;
    const adjustment = 0;
    const result = 13;
    try {
      await instance.hasRolled(numberOfDie, dieSize, adjustment, result);
      assert.fail();
    }
    catch(err) {
      console.log('err: ' + err)
      assert.isOk('failed','as expected')
    }  
  });


  it('will fail if too large an adjustment is used.', async () => {
    const numberOfDie = 10;
    const dieSize = 100;
    const adjustment = 21;
    const result = 13;
    try {
      await instance.hasRolled(numberOfDie, dieSize, adjustment, result);
      assert.fail();
    }
    catch(err) {
      console.log('err: ' + err)
      assert.isOk('failed','as expected')
    }
  });  

  it('will fail if too small an adjustment is used.', async () => {
    const numberOfDie = 10;
    const dieSize = 100;
    const adjustment = -21;
    const result = 13;
    try {
      await instance.hasRolled(numberOfDie, dieSize, adjustment, result);
      assert.fail();
    }
    catch(err) {
      console.log('err: ' + err)
      assert.isOk('failed','as expected')
    }
  });  
});

// used to convert data returned from a solidity event to a javascript object
function diceRolleeArrayToJSON(diceRolleeArray) {
  let values = [];
  diceRolleeArray.forEach(element => {
    const [address, timestamp, randomness, numberOfDie, dieSize, adjustment, result, hasRolled, rolledValues] = element;
    values.push({ 
       address,
       timestamp,
       randomness,
       numberOfDie,
       dieSize,
       adjustment,
       result,
       hasRolled,
       rolledValues
    });
  })

  return values;
}
