const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');


app.use(cors());

app.use(bodyParser.json({ extended: true, limit: '5mb' }))


let readableFile = [];
let names = [];
let result;



const trainFace = async (req, res, next) => {
    console.log('b4')
    const name = req.body._label;
    console.log(name, 'NAME<<<<')
    try {

        //REWITE WITH PROMISEALL
        //  console.log(req.body, '<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<req')
        await new Promise((resolve, reject) => {
            fs.readFile('./labels.json', (err, data) => {
                if (err) { throw err }
                else {

                    resolve(names = JSON.parse(data))
                }
            });

        })
        await new Promise((resolve, reject) => {
            fs.readFile('./faceDescriptions2.json', (err, data) => {
                if (err) { throw err }
                else {

                    resolve(readableFile = JSON.parse(data))
                }
            });

        })
        console.log(names, '<><><><>', readableFile,'<<<<<<<<<<')
        if (names.indexOf(name) === -1) {
            console.log({_label: name, _descriptors: [Object.values(req.body._descriptors[0])]}, '<<<<<<<<<<<<<<,,,')
            readableFile.push({_label: name, _descriptors: Object.values(req.body._descriptors[0])});
            names.push(name);

            console.log(names, '<<<<<<<<<<<<<NAME')
            await new Promise((resolve, reject) => {
                fs.writeFile('./labels.json', JSON.stringify(names), (err) => {
                    if (err) reject(err);
                    else resolve();
                })
            })


            
            await new Promise((resolve, reject) => {
                console.log(readableFile, '<<<READABLE')
                fs.writeFileSync('./faceDescriptions2.json', JSON.stringify(readableFile), (err) => {
                    if (err) reject(err);
                    else resolve();
                })
            })
        }
        else {
            console.log('hit in list')
            result = readableFile.map((fd) => {
                if (fd._label === name && fd._descriptors.length < 10) {
                    newDescriptors = [...fd._descriptors, Object.values(req.body._descriptors[0])]
                    console.log('hit if block', fd._descriptors)
                    return {_label: name, _descriptors: newDescriptors}
                    //  console.log(fd._descriptors, 'HERE<<<<<<<<<<<<<<<<<<<<<<<')
                    
                } else {
                                   
                    return fd;

                }
            })
            console.log(result, 'RESULT<<<<<<<<<<<<<<<<<<<<<<<<<<,', result[0]._descriptors.length)
            await new Promise((resolve, reject) => {
                fs.writeFile('./faceDescriptions2.json', JSON.stringify(result), (err) => {
                    if (err) reject(err);
                    else resolve();
                })
           })
        }
    } catch (err) {
        console.log(err)
    }

}

const loadModel =  async (req, res, next) => {
    console.log('hit load model<<<<<<')
    await new Promise((resolve, reject) => {
        fs.readFile('./faceDescriptions2.json', (err, data) => {
            if (err) reject(err);
            else resolve(readableFile = data);
        })
    }).then(() => {
        console.log('sending<<<<', readableFile)
        res.send(readableFile)



    })
}

train2 = async (req, res, next) => {
    const model = req.body;
    const modelArr = model.map((m) => {
        let ob = {_label: m._label,
            _descriptors: [Object.values(m._descriptors[0])]
        }
        
        return ob;        
    })
    console.log(modelArr[0]._descriptors, 'train2<<<<')

    await new Promise((resolve, reject) => {
       
        fs.writeFile('./faceDescriptions2.json', JSON.stringify(modelArr), (err) => {
            if (err) reject(err);
            else resolve();
        })
    })
    
}





app.post('/train2', train2)


app.get('/load', loadModel)

app.post('/train', trainFace);


app.get('/', () => { console.log({ msg: 'booya' }) });

module.exports = app;