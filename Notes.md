Notes written by Brian Zhao November - December 2020

# Documentation

- to whoever may view these notes.
- these are more in-depth notes about some key aspects of the project
- it might be best to start with an overview of the project before diving straight in
- see advisors and drive and presentation.

## Public Key Infrastructure

### Encryption / Decryption

- familiarize yourself with public key infrastructure
  - also known as PKI, public key cryptography, public key encryption
  - note that public address and public key are not the same thing
  - also familiarize yourself with the concept of hashing (one way)
- we are employing end-to-end encryption for letter contents
  - the only time when files are not encrypted is at viewing and briefly at sending
    - (after decrypting with writer's private key and before encrypting with recipient's keys)
  - at upload, we encrypt with the writer's public key and store it as a buffer in the letters table (letter_contents)
  - at sending, we decrypt the letter with the writer's private key and encrypt it with the recipient's public key
    - this gets stored in the sent_letters table (letter_contents)
  - note this is all using the salsa key
- how do we get the user's public key
  - there are two different public keys that we interact with
    1. public key used by metamask in relation to the "x25519-xsalsa20-poly1305" curve (think the 'salsa') curve
    2. public key in hex that we get from ecrecover (verifysignature method in the auth module, backend)

1. in Cryptservice, we use "eth_getEncryptionPublicKey" to get the salsa public key that we use to encrypt and decrypt letters
- note that the user must have specified account to access the public key
- this prompts the user with metamask to get the key
- we get the publicAddress from window.ethereum 
  - **see** accounts in App.tsx
> this.ethereum.request({ method: "eth_getEncryptionPublicKey", params: [publicAddress], // you must have access to the specified account })

- we use eth-sig-utils to encrypt
  - note that as long as we have the public-key (stored) we don't need to prompt metamask to get the key
  - this can be done without the user having to click encrypt
> import \* as SigUtil from "eth-sig-util";

```
SigUtil.encrypt(
  this.publicKey,
  { data: JSON.stringify(fileData) },
  "x25519-xsalsa20-poly1305"
)
```

- the following is the method to decrypt through metamask
  - note that these metamask calls are wrappers built on top of eth-sig-utils
> this.ethereum.request({ method: "eth_decrypt", params: [file, publicAddress],})

2. the second public key is a hex key that we get retrieve from ec recover
- we will expand on this more in the next section (**see** signing and verification)
- the publicAddress of a wallet / metamask account is *derived* from this publicKey
  - the key is 128 characters long (hex) + 2 characters (0x)
  - the key is therefore 64 bytes long (2 characters to a byte)
  - the address is 40 characters long or 20 bytes
  - how do we get from publicKey to publicAddress??

[important documentation](https://docs.metamask.io/guide/rpc-api.html#other-rpc-methods)
- also do research on elliptical curve cryptography (ECC) and ECDSA

### Signing & Verification
- as seen in point #2 above, how do we get from publicKey to publicAddress?
  - we *derive* the publicAddress from the public key by first hashing it (ethereum uses keccak256)
  - the publicKey (64 bytes) becomes 32 bytes
  - then we take the last 20 bytes which make up the publicAddress
- this is a crucial part of signature verification as ecrecover will allow us to recover the hex public key
  - we can then derive the publicAddress to see if it matches with our stored publicAddress
- so what is this ecrecover? (**see AuthModule in backend**)
  - let's first look at the process of signing
  
#### Signing

> import * as EthUtil from "ethereumjs-util";
> EthUtil.keccak256() // hashing algo used by ethereum

- we use web3/metamask to sign the transaction
  - not that web3.eth.personal.sign is different from web3.eth.sign which is deprecated
  - this posed initial issues with verification that have subsequently been resolved
    - we must use EthUtil.hashPersonalMessage() to have the right prefix for verfication
  - the thing we sign is called the **message**
  - the thing that is the output of signing is called the **signature**
    - the signature is 132 characters long in hex.
      - without the 0x prefix it is 130 characters long or 65 bytes.
      - the first 64 bytes make up what we call the 'r' and 's' part (32 bytes each)
      - the last byte is used to derive the v part of the signature, which is this extra piece of data that *allows* ethereum to recover the publicKey
        - without it verification would not be possible
  - we use the message, signature, and publicAddress to perform *verification* as we will see in a little bit
  
```
web3.eth.personal
  .sign(letter, publicAddress, "", (err, signedLetter) => {
    if (err) {
      console.log("error when signing");
      return reject(err);
    }
    console.log("message signed");
    return resolve(signedLetter);
  })
```

#### Verification
- we talked a little about the signature above and how in verification we need these r, s, and v parts
- r and s make up 64 bytes, each taking up 32 bytes or 64 chars each
- v is derived from the final byte
  - for example 1c (in hex) would be 28 in decimal
- as seen in the following code we can derive this manually or just use ethereumjs to do so with EthUtil.fromRpcSig(signature)

```
// const sig = signature.slice(2, signature.length);
// const offset = 2;
// const r = signature.slice(0 + offset, 64 + offset);
// const s = signature.slice(64 + offset, 128 + offset);
// const v = parseInt(signature[128 + offset], 16) * 16 + parseInt(signature[129 + offset], 16);
```
> const sg = EthUtil.fromRpcSig(signature); // YES

- these r, s, v parts are passed in to ecrecover along with the hash of the message (using keccak256) to recover the publicKey, which then we derive the publicAddress
  - the public key is 64 byte which hashed (keccak256) becomes 32 bytes
  - the last 20 bytes or 40 characters of the hash is the publicAddress
  - we compare this 'recovered' publicAddress with the one stored in the db or found in the metamask account
  - here is the code:

```
// from AuthModule -> verifySignature
const sg = EthUtil.fromRpcSig(signature);
const messageHash = EthUtil.hashPersonalMessage(Buffer.from(message));
const hash = messageHash.toString("hex");
const publicKey = EthUtil.ecrecover(
  Buffer.from(hash, "hex"),
  sg.v,
  sg.r,
  sg.s
);

const pubAddress = EthUtil.bufferToHex(EthUtil.pubToAddress(publicKey));

return EthUtil.toChecksumAddress(pubAddress) ===
EthUtil.toChecksumAddress(publicAddress)
```

- when do we use this?
  1. we use it to authenticate / login
    - in this case the message is nonce that we want the user to sign to verify identity
    - we use uuid() to generate a random string (**a nonce**) to have the user sign
    - by signing and then verifying the signature we can prove that the user has this public/private key pair
      - we don't have to rely on less secure salt + passwords
      - remember that this public key and the salsa public key are different things
        - separation of concerns between signing and verifying and encrypting/decrypting (we have no choice but to follow)
          - allows for flexibility to adapt, if something changes on one end it doesn't affect the other
  2. for letter sending
    - we sign the letter after its been encrypted
    - therefore, we store the letterContents (encrypted) and the letterSignature (signature of the encrypted letter)
    - verification is currently done upon update of the letterContents (at send)
      - it should also be done at retrieving of the sent letter contents by the recipient but this would require an extra query for the writer's publicAddress to verify (Not Implemented)
- there's a lot more to be said but these are the basics

## Tradeoffs and Considerations
- some food for thought, not comprehensive but a general overview of considerations

### Time v Complexity
- with the limited time of 2 semesters, what is the best plan forward to get tangible deliverables while also learning a lot
- making something with complexity in a short period of time
- we decided for MVP to focus on public key infrastructure + metamask and getting the core functionality of our app
  - instead of making a custodian wallet or writing smart contracts to put 
  

### Decentralization/Security vs. User Experience (UX)
- for our mvp, the burden remained on the writer to take action to send to recipients
- want to make it more decentralized
- also want to make the experience as simple, convenient, and intuitive as possible
  - adding tooltips and pointers to help guide users
  - adding tutorials and FAQ and home page
  - adding quality of life changes to improve UX

### FERPA Waiver
- students in our use case (grad schools) are required to waive their ferpa rights which gives access to view education resources including letters of recommendation
- we assume this in making sure that students cannot view the letter of recommendation

## Future Considerations

### Verification of Identity
- our MVP comprises step 1, implementing public key infrastructure
- step #1 is public key infrastructure; step #2 is verification of identity
- for our MVP, we did
- ideas explored for tackling the verification fo identity include
  - third-party oracles
  - reputation staking

### Being a Custodian
- legal issues
  - since you're now dealing with money and legal disputes
- managing other's smart wallet
  - managing public private key pairs

### Transactions on Chain
- who pays for the transactions
- there is a new technology where you can pay gas fees on another entities behalf
- 

### RPC
- instead of REST API
- JSONRPC, OpenRPC

## React
- Typescript recommended
- react-scripts
- using hooks?
- stop using too many modals
  - use more intuitive user design (unlike our MVP)

### React Hooks
- didn't use but should consider
- functional instead of using components
- if using components
  - leverage the idea of components
  - does this component need state?
  - you want more stateless components that just display things

## Links & More

Fontawesome
https://fontawesome.com/how-to-use/on-the-web/styling/sizing-icons

Bootstrap
https://getbootstrap.com/docs/4.0/utilities/text/					

Trello
https://trello.com/

React Bootstrap
https://react-bootstrap.netlify.app/utilities/transitions/#collapse		

The Typeahead for React Bootstrap
http://ericgio.github.io/react-bootstrap-typeahead/#basic-example	

Metamask Other RPC Methods (encryption/decryption)
https://docs.metamask.io/guide/rpc-api.html#other-rpc-methods	

PGAdmin
https://www.pgadmin.org/download/					

1-click metamask Flow (our login flow)
https://www.toptal.com/ethereum/one-click-login-flows-a-metamask-tutorial		

Express JS				
https://expressjs.com/en/api.html	

Typescript
https://typescript.org

HackMD (for Notes)
https://hackmd.io/?nav=overview		

SQL fiddle (SQL playground)
http://sqlfiddle.com/							

PostgreSQL Documentation
https://www.postgresql.org/docs/9.5/sql-insert.html		

Typescript Documentation
https://www.typescriptlang.org/docs/handbook/react.html		

Heroku
https://data.heroku.com/						

Web3JS Documentation
https://web3js.readthedocs.io/en/v1.2.0/web3-eth.html	

Eth-Sig-Utils
https://github.com/MetaMask/eth-sig-util

OpenRPC
https://open-rpc.org/
https://github.com/open-rpc/server-js
https://github.com/open-rpc/generator-client
https://inspector.open-rpc.org/
http://spec.playground.org

JSONRPC
https://www.jsonrpc.org/specification

Coregeth
https://github.com/etclabscore/core-geth

MermaidJS (for diagrams)
https://mermaid-js.github.io/mermaid/#/

OpenZepplin (smart contract library, updating smart contracts)
https://docs.openzeppelin.com/upgrades-plugins/1.x/proxies

Testnet, Slither, Mythril, Consensys/Mythx (smart contract auditing)
https://github.com/ConsenSys/mythx-playground
https://github.com/ConsenSys/mythril
https://cwe.mitre.org/data/definitions/696.html
https://github.com/Z3Prover/z3

EIP ERC-725
https://github.com/ethereum/EIPs/issues/725

Storj Labs (storage, like AWS but decentralized, ancient-server)
https://storj.io/

PBKDF2
https://en.wikipedia.org/wiki/PBKDF2

ETC Signatory
https://github.com/etclabscore/signatory/blob/master/src/lib/sign.test.ts

ETC Pristine (open source best practices)
https://github.com/etclabscore/pristine

Truffle
https://github.com/trufflesuite/truffle

Typechain
https://github.com/ethereum-ts/TypeChain
https://blog.neufund.org/introducing-typechain-typescript-bindings-for-ethereum-smart-contracts-839fc2becf22

Chainid
https://chainid.network/

Remix (IDE)
https://remix.ethereum.org/#optimize=false&evmVersion=null&version=soljson-v0.6.1+commit.e6f7d5a4.js

PlayStudio (IDE)
https://studio.ethereum.org/

Solc (solidity compiler)
https://https://solidity.readthedocs.io/en/v0.6.2

Vyper
https://github.com/vyperlang/vyper)

Solidity (smart contracts)
https://ninabreznik.github.io/workshop-solidity/

Ethereum
https://github.com/ethereumbook/ethereumbook

Eserialize
https://eserialize.com/?input=string&output=hex)

PKI
https://ethereumclassic.org/blog/2017-04-18-keys

Formatic (similar to oauth)
https://fortmatic.com

## Metamask
- browser extension that serves as wallet to connect to networks
- manages a public private key pair
- unique public address
- see links for documentation

## Solidity

## Typechain

## Truffle

## Kotti

## Frontend Interfaces

### FileData

- should be called letterData
- letterUrl is the base64 string that you can pass into an embed, for example, to display the file
- letterUrl is read using FileReader on File (**see** Web API for JS)
- gets encrypted with jsonstringify (**see** CryptService.ts)
- schema
  letterTitle: string;
  letterType: string;
  letterUrl: string;

### LetterContents (unused)

- letterDetails + contents field
- **see** letterDetails
- schema
  letterId: string;
  contents: string;
  letterRequestor: User;
  letterWriter: User;
  requestedAt: Date
  uploadedAt: Date | null;

### LetterDetails

- interface used to populate list for requestor and writer
- takes the necessary fields from the letters table
- two timestamps: requestedAt and uploadedAt - uploadedAt can be null (if null then not uploaded) - the above information is useful for determining what to display
- note that letterRequestor and letterWriter are the result of joins with the user table - **see** backend queries - joined on publicAddress (the primary key for an user - after the join, the queried data is passed through a constructor to create the User objects - frontend User interface and backend User dbmodel are the same
- schema
  letterId: string;
  letterRequestor: User;
  letterWriter: User;
  requestedAt: Date
  uploadedAt: Date | null;

### LetterHistory

- think of it as a join between letters and sent_letters in backend
- letterDetails + letterRecipient (User) and sentAt (Date | null)
- sentAt is useful information for determining whether or not the letterHistory has been sent to the user - writer is not allowed to re-upload a letter already sent to one or more recipients - history button for displaying all the recipients sent to
- **see** letterDetails
- schema
  letterId: string;
  letterRequestor: User;
  letterWriter: User;
  requestedAt: Date
  uploadedAt: Date | null;
  letterRecipient: User;
  sentAt: Date | null;

### User

- basic user information (publicAddress, name)
- used for other interfaces and keeping track of basic user info in lists
- schema
  publicAddress: string;
  name: string;

### UserAuth

- basic user info + jwtToken
- used for authentication (after signing and verification of nonce)
- userAuth in the backend is similar except jwtToken is nonce (random string generated with UUID) - **see** verification of signature
  - ecrecover, eth-sig-utils
- backend passes back a jwtToken - expiration set tentatively for an hour - **see** [backend documentation
- schema
  publicAddress: string;
  name: string;
  jwtToken: string;
- schema backend userAuth
  publicAddress: string;
  name: string;
  nonce: string;

### UserKey

- basic user info + publicKey
- note this is the key for salsa curve\* - **see** encryption, decryption, and signing
- publicKey is used for decryption and encryption - for letter upload (encryption with writer's own public key) - for letter sending (encryption with each recipient's public key) - note this public key is not the same public key (hex) that you get from verifySignature in the backend - separation of concerns
- schema
  publicAddress: string;
  name: string;
  publicKey: string;

### UserProfile -> user info for the profile page

- currently only a few fields
- intended to be whatever publicly displayed information on the userProfile page
- not properly implemented / used
- createdAt is when the user joined (created their account)
- schema
  publicAddress: string;
  name: string;
  profile_image: Buffer | null;

      	createdAt: Date

### RequestBody

- (unused) for the format of the post requests
- should be refactored to use this

### ResponseBody

- format of the response

## Create Schema

```
create table users (
	public_address		varchar(42)	not null,
	name			varchar(32)	not null,
  email			varchar(64)	not null,
	profile_image           bytea,
	created_at		timestamp 	not null,
	nonce			varchar(64)	not null,
	primary key (public_address)
);
create table letters (
	letter_id		varchar(36)	not null,
	letter_contents		varchar(380),    
	letter_writer 		varchar(42)	not null references users(public_address),
	letter_requestor	varchar(42)	not null references users(public_address),
	requested_at		timestamp 	not null,
	uploaded_at             timestamp, 		
	primary key (letter_id)
);
create table sent_letters (
	letter_recipient	varchar(42) 	not null references users(public_address),
	letter_id 		varchar(36)	not null references letters(letter_id),
  sent_at                 timestamp, 		        
  letter_contents         bytea,
  letter_signature        varchar(132),
	primary key (letter_recipient, letter_id)
);
```

## Backend DbModels
- how the backend was initially written and its limitations
  - kind of bulky and can be re-written
- the idea behind the backend interfaces is we have these models that we construct from our queries and pass them in responses
  - gives us typing and structure
  - we have a model to pass only *info that we need* back as a model
    - for example, if we only need basic user info (publicAddress, name), we can use the User model
  - this does give some overhead as for each combination of attributes, you need to create a new model
  - without a model it becomes tricky to use **dbservice.ts**
    - after a query it takes the results for res.rows and calls **dbRowToDbModel** which invokes the constructor of a model to create the object
      - the method takes in a dbRow: any; the result passed from the query is an any[] which is weird and funky -> the method works out, which is all that matters
  - right now, each dbmodel corresponds with a db service
  - how dbservice works is its method that makes a parametized query takes a generic model type which it uses to convert dbrows into db models
    - familiarize yourself with parameterized queries and **node-postgres**
  - the problem with this generic way that the backend was written is that it becomes difficult to get a specific attribute
    - you could create an dbmodels specifically for it; that would be easy, but then you end up with a million different dbmodels
    - it becomes bulky when you have so many dbmodels and dbservices for each combination
    - consideration: you can have a model that gets all the rows and has helpers and getters for a specific attribute

```
// an example of dbRowtoDbModel
static dbRowToDbModel(dbRow: any) {
  const newUser = new UserProfile(
    dbRow.public_address,
    dbRow.name,
    dbRow.profile_image,
    dbRow.created_at
  );
  return newUser;
}
```

### LetterContents
- contents for writer's page
- dbmodel
  letterContents: string | null;

### Letter
- equivalent to LetterDetails on the frontend
- used for reuqestor and writer pages
- dbmodel
  letterId: string;
  letterRequestor: User;
  letterWriter: User;
  requestedAt: Date;
  uploadedAt: Date;

### LetterHistory
- used for letter history and also the recipient page
- basically a letter + letterRecipient (User) + sentAt (Date | null)
- think of it as a join between the letters and sent_letters tables
- dbmodel
  letterId: string;
  letterRequestor: User;
  letterWriter: User;
  requestedAt: Date;
  uploadedAt: Date | null;
  letterRecipient: User;
  sentAt: Date | null;

### LetterRecipientContents
- similar to LetterContents (backend) but with signature for verification
- dbmodel
  letterContents: string | null;
  letterSignature: string | null;

### SentLetter
- used sparingly but the table is super important
- dbmodel
  letterRecipient: string;
  letterId: string;
  sentAt: Date | null;
  letterContents: string;
  letterSignature: string;

### User
- basic user information
- equivalent as User on frontend
- dbmodel
  publicAddress: string;
  name: string;

### UserAuth
- similar to UserAuth on frontend except jwtToken -> nonce
- we get the nonce from the db to be signed
    - the nonce should be reset after a verification (may or may not be implemented)
- dbmodel
  publicAddress: string;
  name: string;
  nonce: string;

### UserKey
- get the publicKey for encryption (letter sending)
- equivalent to UserKey on frontend
- dbmodel
  publicAddress: string;
  name: string;
  publicKey: string;

### UserProfile
- equivalent to UserProfile on frontend
- intended to be all public information on a profile
- dbmodel
  publicAddress: string;
  name: string;
  profileImage: Buffer | null;
  createdAt: Date;
  

## More on Backend

### Routes
  - instead of taking time to document this, they are pretty clear as indicated by the express routes
  - important to note is that many of the controller implementations are not that consistent in what they return on error
    - some return an empty array, some return an emtpy object, some wrap the variable being returned in an object
    - overall its consistency with the frontend that matters and more important deliverables came first
    - note also that major refactoring can produce bugs,and you don't want to be breaking code a crucial moments (c'est un learning process')
    
### JWTtoken / Session
- we use a jwttoken, perhaps incorrectly, really a session?

### Backend Structure
- the way we abstracted dbservice in the backend may not be best
  - the backend should likely be redesigned to not be so bulky
  - each new model required a new model and dbservice to be created
- dbservice is the abstract class that each dbservice extends
- we use node-postgres to connect to our heroku postgres database
- the reason the large majority of routes are POSTS is we wanted to circumvent the issue of no headers for CORS testing
  - this may not be the best decision but it was an easy fix for local testing
  - the reason is that we needed to pass the jwttoken in the body
  
### Environnmental variables
- there are certain environmental variables required before running the backend (also the frontend) for both testing locally and deployed

## How to Run the Frontend

```
// powershell
$Env:REACT_APP_BACKEND_URL="http://localhost:8080"
$Env:REACT_APP_BACKEND_URL="https://verifiable-reference-letter.herokuapp.com"

// bash
export REACT_APP_BACKEND_URL="http://localhost:8080"
export REACT_APP_BACKEND_URL="https://verifiable-reference-letter.herokuapp.com"
```

> npm start

## How to Run the Backend

> npm build-ts; npm start;
