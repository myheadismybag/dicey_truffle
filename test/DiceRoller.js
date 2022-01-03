const { assert } = require('chai')
const DiceRoller = artifacts.require("DiceRoller");

  let instance;

  beforeEach(async () => {
    instance = await DiceRoller.deployed()
    // console.log('instance address: ' + instance.address)
  })

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
      // console.log('err: ' + err)
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
      // console.log('err: ' + err)
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
      // console.log('err: ' + err)
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
      // console.log('err: ' + err)
      assert.isOk('failed','as expected')
    }
  });  
});

contract('DiceRoller rollDiceFast', async (accounts) => { // 666
  it('will add roller to data structures.', async () => {
    try {
      const numberOfDie = 10;
      const dieSize = 11;
      const adjustment = -1;
      let tx = await instance.rollDiceFast(numberOfDie, dieSize, adjustment);
      // console.log(tx)

      let hasRolled = await instance.hasRolledOnce( accounts[0] );
      assert.equal(hasRolled, true, "Address should return true");

      let userRolls = await instance.getUserRolls(accounts[0])
      // console.log('userRolls: ' + userRolls);
      assert.equal(userRolls.length, 1, "getUserRolls should be 1");

      /*
    struct DiceRollee {
        address rollee;
        uint timestamp; /// When the die were rolled
        uint256 randomness; /// Stored to help verify/debug results
        uint8 numberOfDie; /// 1 = roll once, 4 = roll four die
        uint8 dieSize; // 6 = 6 sided die, 20 = 20 sided die
        int8 adjustment; /// Can be a positive or negative value
        int16 result; /// Result of all die rolls and adjustment. Can be negative because of a negative adjustment.
        /// Max value can be 1000 (10 * 100 sided die rolled)
        bool hasRolled; /// Used in some logic tests
        uint8[] rolledValues; /// array of individual rolls. These can only be positive.
      }
      */
      assert.equal(userRolls[0][0], accounts[0], "Number of rolls for user should be 1");
      assert.equal(userRolls[0][3], numberOfDie, "number of dice do not match");
      assert.equal(userRolls[0][4], dieSize, "die size do not match");
      assert.equal(userRolls[0][5], adjustment, "adjustments do not match");
      assert.equal(userRolls[0][7], true, "hasRolled flag should be true");

    }
    catch(err){
      // console.log(err.message)
      assert.fail(null, null, 'Should not fail.')
    }
  });
});

contract('DiceRoller events', async (accounts) => {
  it('will emit events when rollDiceFast is called.', async () => {
    try {
      const numberOfDie = 10;
      const dieSize = 10;
      const adjustment = 0;
      let tx = await instance.rollDiceFast(numberOfDie, dieSize, adjustment);
      // console.log(tx.logs)

      // two events should be fired
      assert.equal(tx.logs.length, 2, "two event should have fired");

      assert.equal(tx.logs[0].event, "DiceRolled", "DiceRolled is expected to be first event");
      assert.equal(tx.logs[1].event, "DiceLanded", "DiceLanded is expected to be second event");

      // validate event args fir DiceRolled event
      // event DiceRolled(bytes32 indexed requestId, address indexed roller);
      let args = tx.logs[0].args;
      // console.log('args: ' + args.requestId)
      assert.isOk(args.requestId > 0, "requestId is expected to be populated");
      assert.equal(args.roller, accounts[0], "roller address is expected to match the user's address");
 
      // validate DiceLanded event data
      /*
      event DiceLanded(
        bytes32 indexed requestId, 
        address indexed roller, 
        uint8[] rolledvalues, 
        int8 adjustment, 
        int16 result
        );
      */  
      args = tx.logs[1].args;
      assert.isOk(args.requestId > 0, "requestId is expected to be populated");
      assert.equal(args.roller, accounts[0], "roller address is expected to match the user's address");
      assert.equal(args.rolledvalues.length, numberOfDie, "rolledvalues length should match number of dice");
      assert.equal(args.adjustment, adjustment, "adjustment should match adjustment passed in");
    }
    catch(err){
      // console.log(err.message)
      assert.fail(null, null, 'Should not fail.')
    }
  });
});

contract('DiceRoller getUserRolls', async (accounts) => {
  it('will return an array from getUserRolls for all rolls by an address.', async () => {
    // console.log('Contract address: ' + instance.address);
    let userRolls = await instance.getUserRolls(accounts[0])
    assert.equal(userRolls.length, 0, "getUserRolls should be 0");
  });

  it('will return an array from getUserRolls for all rolls by an address when they roll.', async () => {
    const numberOfDie = 4;
    const dieSize = 10;
    const adjustment = 0;
    const result = 13;
    await instance.hasRolled(numberOfDie, dieSize, adjustment, result);

    let userRolls = await instance.getUserRolls(accounts[0])
    // console.log('userRolls: ' + userRolls);
    assert.equal(userRolls.length, 1, "getUserRolls should be 1");

    // Rolling again will not change the result
    await instance.hasRolled(numberOfDie, dieSize, adjustment, result);

    userRolls = await instance.getUserRolls(accounts[0])
    //console.log('userRolls: ' + userRolls);
    assert.equal(userRolls.length, 2, "getUserRolls should be 2");
  });

  it('will return an array of structs from getUserRolls for all rolls by an address when they roll.', async () => {

    const numberOfDie = [4,7];
    const dieSize = [6,7];
    const adjustment = [2,-3];
    const result = [13,5];
    await instance.hasRolled(numberOfDie[0], dieSize[0], adjustment[0], result[0], {from: accounts[1]});

    let userRolls = await instance.getUserRolls(accounts[1])
    assert.equal(userRolls.length, 1, "getUserRolls should be 1");

    // Rolling again will not change the result
    await instance.hasRolled(numberOfDie[1], dieSize[1], adjustment[1], result[1], {from: accounts[1]});

    userRolls = await instance.getUserRolls(accounts[1])
    //console.log('userRolls: ' + userRolls);
    assert.equal(userRolls.length, 2, "getUserRolls should be 2");

    /*
    struct DiceRollee {
        address rollee;
        uint timestamp; /// When the die were rolled
        uint256 randomness; /// Stored to help verify/debug results
        uint8 numberOfDie; /// 1 = roll once, 4 = roll four die
        uint8 dieSize; // 6 = 6 sided die, 20 = 20 sided die
        int8 adjustment; /// Can be a positive or negative value
        int16 result; /// Result of all die rolls and adjustment. Can be negative because of a negative adjustment.
        /// Max value can be 1000 (10 * 100 sided die rolled)
        bool hasRolled; /// Used in some logic tests
        uint8[] rolledValues; /// array of individual rolls. These can only be positive.
    }
    */

    const rollerData = diceRolleeArrayToJSON( userRolls)
    // console.log('tttt ' + JSON.stringify(rollerData));

    const roll1 = rollerData[0];
    const roll2 = rollerData[1];
    
    // address should match the roller's address
    assert.equal(roll1.address, accounts[1], "Roller addresses should match");
    assert.equal(roll2.address, accounts[1], "Roller addresses should match");

    // The first structure should match the first roll
    assert.equal(roll1.numberOfDie, numberOfDie[0], "Roller addresses should match");
    assert.equal(roll1.dieSize, dieSize[0], "Roller addresses should match");
    assert.equal(roll1.adjustment, adjustment[0], "Roller addresses should match");
    assert.equal(roll1.result, result[0], "Roller addresses should match");

    // The second structure should match the first roll
    assert.equal(roll2.numberOfDie, numberOfDie[1], "Roller addresses should match");
    assert.equal(roll2.dieSize, dieSize[1], "Roller addresses should match");
    assert.equal(roll2.adjustment, adjustment[1], "Roller addresses should match");
    assert.equal(roll2.result, result[1], "Roller addresses should match");
  });

  it('will return the number of users rolled via getAllUsersCount.', async () => {
    let userCount = await instance.getAllUsersCount();
    assert.equal(userCount, 2, "getAllUsersCount should be 2");
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
