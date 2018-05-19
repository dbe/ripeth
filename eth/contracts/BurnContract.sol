pragma solidity ^0.4.23;

contract BurnContract {
  struct Burn {
    address burnerAddress;
    string message;
    uint burntAmount;
  }

  Burn[] public burns;

  function burn(string _message) public payable {
    require(msg.value > 0);
    Burn memory b = Burn(msg.sender, _message, msg.value);
    burns.push(b);
  }
}
