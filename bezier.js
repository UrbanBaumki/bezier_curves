//Matrix4f
function Matrix4f(list){
	
	this.m = list;

	this.multiplyScalar = function multiplyScalar(skalar, matrix){
		
		var newM = new Array([],[],[],[]);
		for(var v = 0; v < matrix.m.length; v++){
			for(var s = 0; s < matrix.m[v].length; s++){
				newM[v][s] = matrix.m[v][s] * skalar;
			}
		}
		return new Matrix4f(newM);
		
	}

	this.negate = function negate(matrix){
		return this.multiplyScalar(-1, matrix);
	}

	this.add = function add(m1, m2) {
		if(m1.m.length != m2.m.length || m1.m[0].length != m2.m[0].length){
			alert("Matriki nista enakih dimenzij!");
			return;
		}
		var newM = new Array([],[],[],[]);
		for(var v = 0; v < m1.m.length; v++){
			for(var s = 0; s < m1.m[v].length; s++){
				newM[v][s] = m1.m[v][s] + m2.m[v][s];
			}
		}
		return new Matrix4f(newM);
	}
	this.transpose = function transpose(m1){
		var me = m1.m;
		return new Matrix4f(new Array([ me[0][0],me[1][0], me[2][0], me[3][0] ],[ me[0][1],me[1][1], me[2][1], me[3][1] ],[ me[0][2],me[1][2], me[2][2], me[3][2] ],[ me[0][3],me[1][3], me[2][3], me[3][3] ]) );
	}
	this.transposeVec = function transposeVec(){
		var m = this.m;
		return new Matrix4f(new Array([m[0][0], m[1][0],m[2][0],m[3][0]] ,[m[0][1], m[1][1],m[2][1],m[3][1]]));
	}

	this.multiply = function multiply(m1, m2){
		if(m1.m[0].length != m2.m.length){
			alert("Število stolpcev prve matrike se ujemajo s številom vrstic druge matrike!");
			return;
		}

		var newM = new Array( [], [], [], [] );

		for(var i = 0; i < m1.m.length; i++){

			for(var rep = 0; rep < m2.m[0].length; rep++){
				var sum=0;
				for(var j = 0; j < m1.m[i].length; j++){
					sum+= m1.m[i][j] * m2.m[j][rep];
				}
				//tukaj poračuna 1 vrstico z enim stolpcem
				newM[i][rep] = sum;
			}

			
		}

		return new Matrix4f(newM);
	}
	this.getVrstica = function getVrstica(vrstica){
		return this.m[vrstica];
	}
	this.toString = function toString(){
		var string="";

		for(var i = 0; i < this.m.length ; i++){ //izpis matrike 
			string+="[ ";
			for(var j = 0; j < this.m[i].length; j++){
				string+=this.m[i][j] + " ";
			}
			string +="] <br>";
		}
		return string;
	}

}

function Krivulja(m, context, id){
	this.id = id;
	this.m = m;
	this.context = context;
	this.newB = false;
	//all the points 
	this.pts = new Array();
	this.colorr = "rgb(0,0,0)";

	this.cCount = 0;
	this.acc = 0.6;
	this.mc;
	this.ptsMatrix = new Matrix4f(new Array());
	this.independ = 0;
	this.lastPt = null;
	this.stKrivulj = 0;
	this.linearPts = new Array();
	this.koef = new Array();
	this.colors = new Array();
	//vse kalkulirane točke, pripravljene na izris (ob potrebi repainta celotne krivulje):
	this.allTransformedPts = new Array();

	this.tocka = function tocka(e){
		
		this.context.strokeStyle = this.colorr;

		var mX = e.offsetX;
		var mY = e.offsetY;

		this.context.beginPath();
		if(this.cCount % 3 == 0)
			{	
				this.pts.push([mX, mY]);
				if(this.cCount == 0){
				}else if (this.cCount >=3)
					{
						this.lastPt = [mX,mY];
						var prevPoint = this.pt
						this.linearPts.push( [ this.pts[this.independ - 1] , this.lastPt ] );
						
						this.stKrivulj++;
						this.calcKoeficient();
						this.colors.push(this.colorr);
						this.output();
						
					}
				this.context.rect(mX-5,mY-5,10, 10);
				this.newB = true;
			}
		else
			{
				
				if(this.cCount >= 4 && this.newB){
					if(this.lastPt != null){
						this.pts.push(this.lastPt);
					}

					//zvezno spremenimo kooridnate preden dodamo v seznam
					var kk = this.koef[this.stKrivulj-1];
					var k1 = kk[0];
					var n1 = kk[1];
					var k2;
					var isUnder = kk[2];
					var xBehind = kk[5];
					//check the X value 
					if(xBehind && mX < kk[4])
						mX += 2*(kk[4] - mX);
					else if(!xBehind && mX > kk[4])
						mX -= 2*(mX - kk[4] );

					// if both are under the interpolated end, we flip the new point over
					if((isUnder && mY > kk[3]) || (!isUnder && mY < kk[3])){
						if(mY > kk[3]){
							mY -= 2*(mY - kk[3]);
						}else{
							mY += 2*(kk[3] - mY);
						}
					}


					if(k1 == 0)
						k2 = 1;
					else
						k2 = (-1) / k1;

					var n2 = mY - k2 * mX;
					var presX = (-n1 + n2) / (k1 - k2);
					var presY = k2 * presX + n2;
					mX = presX;
					mY = presY;
					this.pts.push([mX, mY]);
					this.independ++;
					

				}else{
					this.pts.push([mX, mY]);
				}
				this.context.arc(mX,mY,5, 0, Math.PI * 2);
				this.newB = false;
			}
		
		this.context.stroke();
		this.independ++;
		this.cCount++;	
		
	}

this.calcKoeficient = function calcKoeficient(){
	var krivulja = this.stKrivulj-1;
	var parxy = this.linearPts[krivulja];

	var xy1 = parxy[0];
	var x1 = xy1[0];
	var y1 = xy1[1];

	var xy2 = parxy[1];
	var x2 = xy2[0];
	var y2 = xy2[1];

	var k = ( y2 - y1 ) / ( x2 - x1 );
	var n = y2 - k * x2;
	var yUnder = false;
	var xLeft = true;
	if(y1 > y2)
		yUnder = true;
	if(x1 > x2)
		xLeft = false;

	this.koef.push([k, n, yUnder, y2, x2, xLeft]);
}
this.output = function output(){
		this.ptsMatrix.m = new Array();
		for(var i = this.stKrivulj*4 - 4; i < this.pts.length; i++){
			this.ptsMatrix.m.push(this.pts[i]);
		}
		this.ptsMatrix = this.ptsMatrix.transposeVec();
		this.multi(false);
	}



this.multi = function multi(repaint){
		//Najprej množenje točk z transformacijsko matriko
		var len = 0;
		var table;
		if(!repaint){
			var mulM = this.ptsMatrix.multiply(this.ptsMatrix, this.m);
			var ptss = new Array(); //točke za izris
			for(var i = 0; i <= 1; i += 0.0005){
				//nove izračunane točke z množenjem z t-jem na krivulji (pozicijo)
				this.mc = mulM.multiply(mulM , new Matrix4f([[1], [i], [Math.pow(i, 2)], [Math.pow(i, 3)]]));
				ptss.push(this.mc); //novo naračunane točke krivulje potisnemo v tabelo za izris
				//pravtako v tabelo za vse kalkulirane točke
				this.allTransformedPts.push(this.mc);
			}
			len = ptss.length;
			table = ptss;
		}else{
			this.context.strokeStyle = this.colorr;
			len = this.allTransformedPts.length;
			table = this.allTransformedPts;
			
		}
		// izrišemo in povežemo sosednji točki z ravno črto
		for(var j = 1; j < len; j++){
			
				this.context.beginPath();
				this.context.moveTo(table[j-1].m[0][0],table[j-1].m[1][0]);
				this.context.lineTo(table[j].m[0][0], table[j].m[1][0]);
				this.context.stroke();
			
		}
		if(repaint)
			this.paintPts();
	}
	
	this.paintPts = function paintPts(){
		var st = 0;
		var colPick = 0;
		for(var i = 0; i < this.pts.length; i++){
			if(st > 3)
				{st = 0;
					colPick++;
				}
			this.context.beginPath();
			this.context.strokeStyle = this.colors[colPick];
				if(st%3 == 0)				
					this.context.rect(this.pts[i][0] -5, this.pts[i][1] -5, 10 ,10);
				else
					this.context.arc(this.pts[i][0],this.pts[i][1],5, 0, Math.PI * 2);
				this.context.stroke();
				st++;
			
			
			
		}
	}
	this.checkCollision = function checkCollision(e){
		var mX = e.offsetX;
		var mY = e.offsetY;
		for(var i = 0 ; i < this.pts.length; i++){
			var point = this.pts[i];
			var x = point[0];
			var y = point[1];
			if(mX >= x-5 && mX <= (x+10)){
				if(mY >= y-5 && mY <= (y+10)){
					return i;
				}
				return null;
			}
		}
	}
}