import { ethers } from "./ethers-5.6.esm.min.js"
import { abi } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const getCurrentAccountButton = document.getElementById("getCurrentAccountButton")
const UpdateAccounts = document.getElementById("UpdateAccounts")
connectButton.onclick = connect
UpdateAccounts.onclick = connect
fundButton.onclick = fund
getCurrentAccountButton.onclick = GetSelectedAccount


async function connect() {
  if (typeof window.ethereum !== "undefined") {
    try {
      await ethereum.request({ method: "eth_requestAccounts" })
      connectButton.innerHTML = "Connected"
      const accounts = await ethereum.request({ method: "eth_accounts" })
      console.log(accounts)
      const provider = new ethers.providers.Web3Provider(window.ethereum)  
      document.getElementById("tBodyConnectedAccounts").innerHTML = "";
      accounts.forEach(async element => {
        let balance = await provider.getBalance(element)
        let balanceInETH = ethers.utils.formatEther(balance);
        document.getElementById("tBodyConnectedAccounts").innerHTML +="<tr><td>"+ element + "</td><td>" +balanceInETH+ "</td></tr>"
    }); 
    } catch (error) {
      console.log(error)
    }
    
  } else {
    connectButton.innerHTML = "Please install MetaMask"
  }
}
async function GetSelectedAccount()
{
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)  
      const signer = provider.getSigner()  
    try {
      const signerAddress = await signer.getAddress()
      const balance = await provider.getBalance(signerAddress)
      document.getElementById("FromAccount").value = signerAddress
      document.getElementById("Balance").value = ethers.utils.formatEther(balance)  
    } catch (error) {
      console.log(error)
    }
    
  } else {
    connectButton.innerHTML = "Please install MetaMask"
  }      
}
async function fund() {
  const ethAmount = document.getElementById("ethAmount").value
  console.log(`Funding with ${ethAmount}...`)
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    
    const contract = new ethers.Contract(document.getElementById("ethAddress").value, abi, signer)
    document.getElementById("fundButton").innerHTML = "Loading..."
    document.getElementById("fundButton").disabled = true
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      })      
      await listenForTransactionMine(transactionResponse, provider)
    } catch (error) {
      console.log(error)
    }
  } else {
    fundButton.innerHTML = "Please install MetaMask"
  }
  document.getElementById("fundButton").innerHTML = "Send ETH"
  document.getElementById("fundButton").disabled = false
}



function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}`)
    return new Promise((resolve, reject) => {
        try {
            provider.once(transactionResponse.hash, (transactionReceipt) => {
                console.log(
                    `Completed with ${transactionReceipt.confirmations} confirmations. `
                )
                resolve()
            })
        } catch (error) {
            reject(error)
        }
    })
}
