import axios from 'axios';

const PINATA_API_KEY = '5829a1edf8e629f1da12';
const PINATA_SECRET_API_KEY = 'a01cd48e4531e1c39be3be7066d51f010d0def50815b413ef20aa86419517d69';

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const metadata = JSON.stringify({ name: file.name });
  formData.append('pinataMetadata', metadata);

  const options = JSON.stringify({ cidVersion: 1 });
  formData.append('pinataOptions', options);

  const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
    maxBodyLength: 'Infinity',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
      'pinata_api_key': PINATA_API_KEY,
      'pinata_secret_api_key': PINATA_SECRET_API_KEY
    }
  });

  const hash = res.data.IpfsHash;
  console.log("✅ IPFS hash from Pinata:", hash);
  return hash; // IMPORTANT — only the hash!
}
