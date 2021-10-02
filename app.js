const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const {
    body,
    validationResult,
    check
} = require('express-validator');
const methodOverride = require('method-override');

require('./utils/db')
const {
    Contact
} = require('./model/contact');

const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

const app = express();
const port = 3000;

// setup method override
app.use(methodOverride('_method'));

app
    .set('view engine', 'ejs')
    .use(expressLayouts)
    .use(express.static('public'))
    .use(express.urlencoded({
        extended: true
    }));

app
    .use(cookieParser('secret'))
    .use(
        session({
            cookie: {
                maxAge: 6000
            },
            secret: 'secret',
            resave: true,
            saveUninitialized: true
        })
    )
    .use(flash())

// ! halaman home
app
    .get('/', (req, res) => {
        const mahasiswa = [{
            nama: 'Pahrurozi',
            email: 'pahrurozi17@gmail.com'
        }];

        res.render('index', {
            title: 'Home',
            layout: 'layouts/main-layouts',
            mahasiswa,
        });
    })

// ! halaman about
app
    .get('/about', (req, res) => {
        res.render('about', {
            title: 'About',
            layout: 'layouts/main-layouts'
        });
    })

// ! halaman contact
app
    .get('/contact', async (req, res) => {
        const contacts = await Contact.find();
        res.render('contact', {
            title: 'Contact',
            layout: 'layouts/main-layouts',
            contacts,
            msg: req.flash('msg')
        });
    })
    // > form tambah data contact
    .get('/contact/add', (req, res) => {
        res.render('add-contact', {
            title: 'Tambah Data',
            layout: 'layouts/main-layouts'
        });
    })
    // > proses tambah data contact
    .post(
        '/contact',
        [
            body('nama').custom(async (value) => {
                const duplikat = await Contact.findOne({
                    nama: value
                });
                if (duplikat) {
                    throw new Error('Nama contact sudah digunakan!');
                }
                return true;
            }),
            check('email', 'Email tidak valid!').isEmail(),
            check('nohp', 'No HP tidak valid!').isMobilePhone()
        ],
        (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.render('add-contact', {
                    title: 'Tambah Data',
                    layout: 'layouts/main-layouts',
                    errors: errors.array()
                })
            } else {
                Contact.insertMany(req.body, (error, result) => {
                    req.flash('msg', 'Data contact berhasil di tambahkan');
                    res.redirect('/contact');
                });
            }
        })
    // > delete contact
    // .get('/contact/delete/:nama', async (req, res) => {
    //     const contact = await Contact.findOne({
    //         nama: req.params.nama
    //     });
    //     if (!contact) {
    //         res.status(404);
    //         res.send(`<h1>File not found!</h1>`)
    //     } else {
    //         Contact.deleteOne({
    //             _id: contact._id
    //         }).then((result) => {
    //             req.flash('msg', 'Data contact berhasil dihapus');
    //             res.redirect('/contact');
    //         });
    //     }
    // })
    .delete('/contact', (req, res) => {
        Contact.deleteOne({
                _id: req.body.id
            })
            .then((result) => {
                req.flash('msg', 'Data contact berhasil dihapus');
                res.redirect('/contact');
            })
    })
    // > form edit data
    .get('/contact/edit/:nama', async (req, res) => {
        const contact = await Contact.findOne({
            nama: req.params.nama
        });
        res.render('edit-contact', {
            title: 'Form Edit Data',
            layout: 'layouts/main-layouts',
            contact
        })
    })
    // > proses edit data contact
    .put('/contact',
        [
            body('nama').custom(async (value, {
                req
            }) => {
                const duplikat = await Contact.findOne({
                    nama: value
                });
                // * req.body.oldNama != value jika sama
                if (req.body.oldNama == value && duplikat) {
                    throw new Error('Nama sudah di gunakan!');
                }
                return true;
            }),
            check('email', 'Email tidak valid!').isEmail(),
            check('nohp', 'No HP tidak valid!').isMobilePhone('id-ID'),
        ],
        (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.render('edit-contact', {
                    title: 'Form ubah data contact',
                    layout: 'layouts/main-layouts',
                    errors: errors.array(),
                    contact: req.body
                })
            } else {
                Contact.updateOne({
                    _id: req.body._id
                }, {
                    $set: {
                        nama: req.body.nama,
                        email: req.body.email,
                        nohp: req.body.nohp
                    }
                }).then(result => {
                    // kirimkan falsh message
                    req.flash('msg', 'Data contact berhasil diubah!');
                    res.redirect('/contact');
                }).catch(error => {
                    console.log(error);
                });
            }
        })
    // > detail
    .get('/contact/:nama', async (req, res) => {
        const contact = await Contact.findOne({
            nama: req.params.nama
        });
        res.render('detail', {
            title: 'Detail',
            layout: 'layouts/main-layouts',
            contact,
            msg: req.flash('msg')
        });
    })

app
    .listen(port, () => {
        console.log(`Mongo contact app | listening at http://localhost:${port}`);
    })