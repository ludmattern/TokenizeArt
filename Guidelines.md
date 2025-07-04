IV.1 Creating the image of your NFT
In order to create a non-fungible token, there are several technical requirements that
must be met.
Your image must be stored using distributed registry technology
(IPFS, for example).
First and foremost, you will need to choose a blockchain platform that supports the
creation of non-fungible token. There are many different options to choose from, each
with its own unique features and capabilities.
You must submit the code used to create your non-fungible token in a code folder
located at the root of your repository. You should be careful to comment your code and
to use readable and explicit variable/function names.
You must be very careful about how you demonstrate the operation of your nonfungible token. You must be able to perform minimalist actions to demonstrate its
operation. You need to think about all aspects of security such as ownership or privileges.
You should also place all the necessary files for the deployment of your non-fungible token
in a second folder with a name of your choice
After you have minted your non-fungible token on a public blockchain, please mention
the public address and the network used in your Git repository. You should be able to
display your NFT.
Below is an example of the expected directory structure:
```bash
$> ls -al
total XX
drwxrwxr-x 3 eagle eagle 4096 avril 42 20:42 .
drwxrwxrwt 17 eagle eagle 4096 avril 42 20:42 ..
drwxrwxr-x 3 eagle eagle 4096 avril 42 20:42 code
drwxrwxr-x 3 eagle eagle 4096 avril 42 20:42 deployment
drwxrwxr-x 3 eagle eagle 4096 avril 42 20:42 mint
```
• A beautiful NFT
• A website where you can mint your NFT with a graphical interface
• You need to manage your NFT Inscriptions, i.e. store your metadata and image
storage directly on-chain
