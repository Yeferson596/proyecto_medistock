const {Pool}=require('pg');
const pool=new Pool({connectionString:'postgres://postgres:postgres@localhost:5432/medistock'});
(async()=>{
  try{
    const res=await pool.query('select $1::jsonb as x',[ [{productId:'p_001',quantity:2,price:500}] ]);
    console.log('OK', JSON.stringify(res.rows));
  }catch(e){
    console.error('ERR', e.message);
  } finally{
    await pool.end();
  }
})();
