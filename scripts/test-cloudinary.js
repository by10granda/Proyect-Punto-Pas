const cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: 'dbbkpdhze',
  api_key: '551695691832236',
  api_secret: 'GiVf3QH47GrSYU58xwqAVAdFWQs',
});

cloudinary.api.resources({
  type: 'upload',
  prefix: 'PRODUCTOS/',
  max_results: 5
}, function(error, result) {
  if(error) {
    console.log('Error:', error);
  } else {
    console.log('Total resources:', result.resources.length);
    console.log('\nSample files:');
    result.resources.forEach(r => {
      console.log('public_id:', r.public_id);
      console.log('filename:', r.public_id.split('/').pop());
      console.log('url:', r.secure_url);
      console.log('---');
    });
  }
});
