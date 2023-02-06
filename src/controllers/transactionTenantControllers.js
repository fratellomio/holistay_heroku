const database = require('../models');
const { Op, Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const nodemailer = require('../middlewares/nodemailer');
const handlebars = require('handlebars');

module.exports = {
  transactionsUser: async (req, res) => {
    const { tenantId, status } = req.params;
    try {
      const response = await database.transaction.findAll({
        attributes: ['id', 'checkIn', 'checkOut', 'transactionStatus'],
        include: [
          {
            model: database.room,
            attributes: ['name', 'price'],
            include: [
              {
                model: database.property,
                attributes: ['tenantId', 'name'],
              },
            ],
          },
          {
            model: database.user,
            attributes: ['fullName', 'email'],
          },
        ],
        having: {
          [Op.and]: [
            { 'room.property.tenantId': tenantId },
            { transactionStatus: status },
          ],
        },
      });

      res.status(201).send(response);
    } catch (err) {
      console.log(err);
      res.status(404).send(err);
    }
  },
  getTotalTransaction: async (req, res) => {
    const { tenantId } = req.params;
    try {
      const response = await database.transaction.findAll({
        attributes: [
          'transactionStatus',
          [Sequelize.fn('Count', Sequelize.col('transactionStatus')), 'Count'],
        ],
        where: {
          transactionStatus: [
            'Menunggu Konfirmasi Pembayaran',
            'Diproses',
            'Menunggu Pembayaran',
          ],
        },
        include: [
          {
            model: database.room,
            attributes: [],
            required: true,
            include: [
              {
                model: database.property,
                attributes: [],
                where: { tenantId: tenantId },
              },
            ],
          },
        ],
        group: ['transactionStatus'],
        raw: true,
      });

      res.status(200).send(response);
    } catch (err) {
      console.log(err);
      res.status(404).send(err);
    }
  },
  acceptTransaction: async (req, res) => {
    const data = req.body;
    const input = {
      email: data.user.email,
      fullName: data.user.fullName,
      qrcode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${data.id}`,
      roomName: data.room.name,
      propertyName: data.room.property.name,
      checkIn: new Date(data.checkIn).toLocaleString('en', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      checkOut: new Date(data.checkOut).toLocaleString('en', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      invoiceNo: data.id,
      invoiceDate: new Date().toLocaleString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    };
    console.log(input);
    try {
      var templateHtml = fs.readFileSync(
        path.join(
          process.cwd(),
          './src/emailTemplates/generate-pdf/index.html'
        ),
        'utf8'
      );
      var template = handlebars.compile(templateHtml);
      var html = template(input);

      var milis = new Date();
      milis = milis.getTime();

      var pdfPath = path.join(
        './src/public/pdf',
        `${'Invoice'}-${'Ilham Hidayatulloh'}-${milis}.pdf`
      );

      var options = {
        format: 'A4',
        margin: {
          top: '30px',
          bottom: '30px',
          right: '30px',
          left: '30px',
        },
        printBackground: true,
        path: pdfPath,
      };

      const browser = await puppeteer.launch({
        args: ['--no-sandbox'],
        headless: true,
      });

      var page = await browser.newPage();
      await page.goto(`data:text/html;charset=UTF-8,${html}`, {
        waitUntil: 'networkidle0',
      });
      await page.addStyleTag({
        path: './src/emailTemplates/generate-pdf/style.css',
      });
      await page.pdf(options);
      await browser.close();

      const tempEmail = fs.readFileSync(
        './src/emailTemplates/generate-pdf/email.html',
        'utf-8'
      );
      const tempCompile = handlebars.compile(tempEmail);
      const tempResult = tempCompile(input);

      await nodemailer.sendMail({
        from: 'Admin',
        to: data.user.email,
        subject: `[Holistay] Vocher Hotel Anda ${data.room.property.name}`,
        attachments: [{ path: pdfPath }],
        html: tempResult,
      });

      await database.transaction.update(
        { transactionStatus: 'Diproses' },
        {
          where: {
            id: data.id,
          },
        }
      );

      res.status(201).send('Success Confirm');
    } catch (err) {
      console.log(err);
      res.status(404).send(err);
    }
  },
  rejectTransaction: async (req, res) => {
    const { id } = req.body;
    try {
      await database.transaction.update(
        { transactionStatus: 'Dibatalkan' },
        {
          where: {
            id,
          },
        }
      );

      res.status(201).send('Success Confirm');
    } catch (err) {
      console.log(err);
      res.status(404).send(err);
    }
  },
  cancelUserOrders: async (req, res) => {
    try {
      await database.transaction.update(
        {
          transactionStatus: 'Gagal',
        },
        {
          where: {
            id: req.params.id,
          },
        }
      );
      res.status(201).send('cancel user orders success');
    } catch (err) {
      console.log(err);
      res.status(404).send(err);
    }
  },
  acceptUserOrders: async (req, res) => {
    try {
      await database.transaction.update(
        {
          transactionStatus: 'Menunggu Konfirmasi Pembayaran',
        },
        {
          where: {
            id: req.params.id,
          },
        }
      );
      res.status(201).send('user orders accept');
    } catch (err) {
      console.log(err);
      res.status(404).send(err);
    }
  },
  getTransaction: async (req, res) => {
    const { tenantId } = req.params;
    try {
      const response = await database.transaction.findAll({
        attributes: [
          'id',
          ['checkIn', 'from'],
          ['checkOut', 'to'],
          'transactionStatus',
          [
            Sequelize.fn(
              'concat',
              Sequelize.col('transaction.id'),
              ' - ',
              Sequelize.col('user.fullName'),
              ' - ',
              Sequelize.col('room.name')
            ),
            'title',
          ],
          [
            Sequelize.fn('MONTH', Sequelize.col('transaction.checkIn')),
            'month',
          ],
        ],
        include: [
          {
            model: database.room,
            attributes: ['name', 'price'],
            include: [
              {
                model: database.property,
                attributes: ['tenantId', 'name'],
              },
            ],
          },
          {
            model: database.user,
            attributes: ['fullName', 'email'],
          },
        ],
        having: {
          [Op.and]: [
            { 'room.property.tenantId': tenantId },
            {
              transactionStatus: [
                'Menunggu Konfirmasi Pembayaran',
                'Diproses',
                'Menunggu Pembayaran',
              ],
            },
          ],
        },
      });

      res.status(201).send(response);
    } catch (err) {
      console.log(err);
      res.status(404).send(err);
    }
  },
  getDataChart: async (req, res) => {
    const { tenantId, curentYear } = req.params;
    const result = [
      { Bulan: 'Januari' },
      { Bulan: 'Februari' },
      { Bulan: 'Maret' },
      { Bulan: 'April' },
      { Bulan: 'Mei' },
      { Bulan: 'Juni' },
      { Bulan: 'Juli' },
      { Bulan: 'Agustus' },
      { Bulan: 'September' },
      { Bulan: 'Oktober' },
      { Bulan: 'November' },
      { Bulan: 'Desember' },
    ];
    try {
      const response = await database.transaction.findAll({
        attributes: [
          'transactionStatus',
          [
            Sequelize.fn(
              'Count',
              Sequelize.col('transaction.id', 'transactionStatus')
            ),
            'Count',
          ],
          [
            Sequelize.fn('MONTH', Sequelize.col('transaction.checkIn')),
            'month',
          ],
          [Sequelize.fn('YEAR', Sequelize.col('transaction.checkIn')), 'year'],
        ],
        include: [
          {
            model: database.room,
            attributes: [],
            required: true,
            include: [
              {
                model: database.property,
                attributes: [],
                where: { tenantId: tenantId },
              },
            ],
          },
        ],
        group: ['transactionStatus', 'month', 'year'],
        having: { year: curentYear },
      });
      response.map(
        (item) =>
          (result[item.dataValues.month - 1][
            item.dataValues.transactionStatus
          ] = item.dataValues.Count)
      );
      const chart = result.filter((item) => Object.keys(item).length > 1);

      res.status(201).send(chart);
    } catch (err) {
      console.log(err);
      res.status(404).send(err);
    }
  },
};
