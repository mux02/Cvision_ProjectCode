exports.handler = function(event, context) {
    
var AWS = require('aws-sdk');

var s3 = new AWS.S3();

var eltr = new AWS.ElasticTranscoder({
    region: 'us-east-1'
});

console.log('Executing Elastic Transcoder Orchestrator');
var bucket = event.Records[0].s3.bucket.name;
var key = event.Records[0].s3.object.key;
var pipelineId = '1678833519029-8ymx74';

if (bucket !== 'cvision-storagebucket') {
    context.fail('Incorrect Video Input Bucket');
    return;
}

var srcKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, "")); //the object may have spaces 
var newKey = key.split('.')[0];
var todayTime = Math.round((new Date()).getTime() / 1000);
var params = {
    PipelineId: pipelineId,
    OutputKeyPrefix: 'output' + '/',
    Input: {
        Key: srcKey,
        FrameRate: 'auto',
        Resolution: 'auto',
        AspectRatio: 'auto',
        Interlaced: 'auto',
        Container: 'auto'
    },
    Outputs: [{
        Key: 'videos/' + newKey + '.mp4',
        ThumbnailPattern: 'thumbs/' + newKey + '-{count}',
        PresetId: '1351620000001-000010', //Generic 720p
    }]
};
console.log('Starting Job');

eltr.createJob(params, function(err, data){
if (err){
    console.log(err);
} else {
    console.log(data);
}
    context.succeed('Job well done');
    });
};
