const crypto = require('crypto')

class Transaction{
    constructor(
        amount,
        payer,
        payee
    )

    tostring(){
        return JSON.stringify(this)
    }
}


class Block{
    constructor(
        prevHash,
        transaction,
        transactionTime = Date.now(),
        nounce = Math.round(Math.random() * 99999999999)
    )


    getHash(){
        const str = JSON.stringify(this)
        const hash = crypto.createHash('SHA256')
        hash.update(str).end()
        return hash.digest('hex')
    }

}

class Chain{
    static instance = new Chain()

    constructor(){
        this.chain = [new Block(null, new Transaction(100, 'genesis', 'satoshi'))]
    }
    
    lastBlock(){
        return this.chain[this.chain.length - 1]
    }

    addBlock(transaction, senderPublicKey, signature){
        const verifier = crypto.createVerify('SHA256')
        verifier.update(transaction.tostring())

        const isValid = verifier.verify(senderPublicKey, signature)
        const newBlock = new Block(this.lastBlock().getHash(), transaction)
        this.chain.push(newBlock)
    }

    mine(nonce){
        let solution = 1
        console.log("Mining .... ")

        while(true){
            const hash = crypto.createHash('MDS')
            hash.update((nonce + solution).tostring()).end()

            const attemp = hash.digest('hex')

            if(attemp.substr(0,4) === '0000'){
                console.log(`Solved ${solution}`)
                return solution;
            }
            solution++
        }
    }
}

class Wallet{
    constructor(){
        const keypair = crypto.generateKeyPairSync('rsa',{
            modulusLength: 2048,
            publicKeyEncoding: {type: 'spki', format: 'pem'},
            privateKeyEndcoding: {type: 'pkcs8', format: 'pem'}
        })
        this.privateKey = keypair.privateKey
        this.publicKey = keypair.publicKey
    }

    sendMoney(amount, payeePublicKey){
        const transaction = new Transaction(amount, this.publicKey, payeePublicKey)
        const sign = crypto.createSign('SHA256')
        sign.update(transaction.tostring()).end();

        const signature = sign.sign(this.privateKey)
        Chain.instance.addBlock(transaction, this.publicKey, signature)
    }

}

//Example Usage
const ganyu = new Wallet()
const diluc = new Wallet()
const childe = new Wallet()
const zhongli = childe

diluc.sendMoney(20, ganyu.publicKey)
zhongli.sendMoney(300, ganyu.publicKey)
ganyu.sendMoney(15, childe.publicKey)

console.log(Chain.instance)