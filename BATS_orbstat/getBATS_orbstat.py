import configparser
import logging
import os
import time
from datetime import datetime
from logging.handlers import TimedRotatingFileHandler

import influxdb_client
import requests
from bs4 import BeautifulSoup
from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS

dataUrl = "http://iesanta.earth.sinica.edu.tw/orbstat/weborbstat.php"
record_per_sec=1
rootDir='/home/dmc/BATS_orbstat/'

def read_influxToken(file_path=rootDir+'influxDB.ini'):
    # 创建配置解析器
    config = configparser.ConfigParser()
    # 读取配置文件
    config.read(file_path)
    # 获取参数值
    param = config.get('Settings', 'INFLUXDB_TOKEN')
    return param

def get_logger():
    # 获取今天的日期
    today_date = datetime.now().strftime("%Y-%m-%d")
    log_file = f"{rootDir}log/{today_date}.log"

    # 设置日志记录
    log_formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    
    # 创建 TimedRotatingFileHandler，设置每天轮转一次
    handler = TimedRotatingFileHandler(log_file, when="midnight", interval=1, backupCount=7, encoding='utf-8')
    handler.setFormatter(log_formatter)

    # 获取 logger 实例
    logger = logging.getLogger(__name__)
    logger.setLevel(logging.INFO)
    logger.addHandler(handler)

    return logger

def request_data():
    r = requests.get(dataUrl)
    # print(dir(r))
    # print(r.headers)
    html=r.text

    # 使用BeautifulSoup解析HTML
    soup = BeautifulSoup(html, 'html.parser')

    # 找到包含表格数据的div
    table_div = soup.find('div', {'id': 'dl'})

    # 找到表格中的所有行
    rows = table_div.find('table').find('tbody').find_all('tr')

    data=[]
    # 遍历每一行，提取数据并打印
    for row in rows:
        columns = row.find_all('td')
        station_name = columns[0].text
        data_latency = columns[1].text.strip()
        nbytes = columns[2].text.strip()
        data.append({'station':station_name,'latency':float(data_latency),'nbytes':float(nbytes)})
        # print(f"Station Name: {station_name}, Data Latency: {data_latency}, Nbytes: {nbytes}")
    return data

# 配置信息
influxToken = read_influxToken()
org = "dmc"
url = "http://192.168.211.99:8086"
bucket="BATS_orbstat"
# print(f"Parameter : {influxToken}")

# 创建 InfluxDB 客户端
write_client = influxdb_client.InfluxDBClient(url=url, token=influxToken, org=org)
write_api = write_client.write_api(write_options=SYNCHRONOUS)
logger=get_logger()

T0= time.time()

for i in range(60):
    T1 = T0 + i

    points = []
    dataList=request_data()
    # print(dataList)

    # 创建点的列表
    for d in dataList:
        point = (
            Point("data")
            .tag("station", d['station'])
            .field("latency", d['latency'])
            .field("nbytes", d['nbytes'])
        )
        points.append(point)

    # 一次性写入多个点
    try:
        write_api.write(bucket=bucket, org=org, record=points)
        logger.info(f"{len(points)} datas written successfully.")
    except Exception as e:
        logger.error(f"Error writing data: {e}")
    Tnow=time.time()
    time.sleep(record_per_sec-(Tnow-T1))

# 关闭 InfluxDB 客户端连接
write_client.close()
